---
description: Generate GitHub issues, gates, and milestones from an architecture plan
argument-hint: [plan-file-path]
---

Generate GitHub issues from an architecture optimization plan.

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/universal/plan-to-issues/SKILL.md

## Configuration

This command reads repository settings from config files:
- **Project Config:** `.claude/config/project-board.json` (organization, repository, project IDs)
- **Sprint Config:** `.claude/config/sprints.json` (sprint definitions and milestones)

## Reference

The plan file path is passed as an argument. If not provided, check your project's documentation for the default plan location.

## Overview

This command automates the entire GitHub project setup workflow:

1. **Parse Plan** - Extract sprints, tasks, and acceptance criteria from the plan document
2. **Create Milestones** - Create a GitHub milestone for each sprint
3. **Create Task Issues** - Create detailed issues for each task with checklists
4. **Create Gate Issues** - Create gate verification issues for each sprint
5. **Assign to Milestones** - Link all issues to their respective sprint milestones
6. **Add Labels** - Apply sprint labels to all issues
7. **Generate Summary** - Output a completion report

---

## Usage

```
/plan-to-issues path/to/your-plan-document.md
```

Example:
```
/plan-to-issues docs/site-refactor/ARCHITECTURE-OPTIMIZATION-PLAN_v4.md
```

---

## Input Requirements

The plan document must contain:

1. **Sprint Structure** - Clearly defined sprints with names (e.g., "Sprint 0: Foundation")
2. **Task Lists** - Numbered tasks within each sprint
3. **Acceptance Criteria** - Success criteria for each sprint/task
4. **Agent Mapping** - Reference to which AI agents handle each task (from AGENT-SPRINT-MAPPING)

---

## Output Format

### Issue Title Format
```
Sprint[N].[ID] - [Task Name]
```

Example: `Sprint0.1 - TypeScript Installation & Configuration`

### Gate Issue Title Format
```
Sprint[N].G - Sprint [N] Gate
```

Example: `Sprint0.G - Sprint 0 Gate`

### Milestone Format
```
Sprint [N]: [Sprint Name]
```

Example: `Sprint 0: Foundation`

---

## Issue Template Structure

Each task issue includes:

```markdown
## Objective
[Brief description of what this task accomplishes]

## Checklist
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Validation
\`\`\`bash
# Commands to verify completion
npm run build
npm run lint
\`\`\`

## AI Agents / Skills
- **Primary Agent:** [agent-name]
- **Skill File:** @.claude/skills/[skill-path]/SKILL.md

## Related
- **Sprint:** [N]
- **Milestone:** Sprint [N]: [Name]
- **Dependencies:** #[issue-numbers]
- **Blocks:** #[issue-numbers]
```

---

## Gate Issue Template

Each gate issue includes:

```markdown
## Sprint [N] Gate Verification

All tasks in Sprint [N] must be completed before proceeding.

## Pre-Gate Checklist
- [ ] All sprint tasks completed
- [ ] Build passes: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] [Sprint-specific checks]

## Validation Commands
\`\`\`bash
npm run build
npm run lint
[additional commands]
\`\`\`

## Sign-off
- [ ] All criteria verified
- [ ] Ready to proceed to Sprint [N+1]

## Related Issues
[Links to all task issues in this sprint]
```

---

## Execution Steps

### Step 1: Parse the Plan Document

Read the plan file and extract:
- Sprint names and numbers
- Task names and descriptions
- Acceptance criteria
- Dependencies between tasks

### Step 2: Read Agent Mapping

Cross-reference with AGENT-SPRINT-MAPPING to get:
- Primary agent for each task
- Skill file references
- Tool requirements

### Step 3: Create Milestones

```bash
# For each sprint, create a milestone via GitHub API
gh api repos/OWNER/REPO/milestones \
  --method POST \
  -f title="Sprint N: Name" \
  -f state="open" \
  -f description="Sprint description"
```

### Step 4: Create Task Issues

```bash
# For each task, create an issue with full template
gh issue create \
  --repo OWNER/REPO \
  --title "SprintN.ID - Task Name" \
  --body "$(cat <<'EOF'
[Full issue body from template]
EOF
)" \
  --label "Sprint: N"
```

### Step 5: Create Gate Issues

```bash
# For each sprint, create a gate issue
gh issue create \
  --repo OWNER/REPO \
  --title "SprintN.G - Sprint N Gate" \
  --body "$(cat <<'EOF'
[Full gate body from template]
EOF
)" \
  --label "Sprint: N,gate"
```

### Step 6: Assign to Milestones

```bash
# Assign each issue to its sprint milestone
gh issue edit ISSUE_NUMBER \
  --repo OWNER/REPO \
  --milestone "Sprint N: Name"
```

### Step 7: Generate Summary Report

Output a table showing:
- Total issues created
- Issues per milestone
- Gate issues created
- Links to view in GitHub

---

## Configuration

### Repository Settings

Repository settings are loaded from `.claude/config/project-board.json`:

```bash
# Read from config file
PROJECT_CONFIG=".claude/config/project-board.json"

OWNER=$(jq -r '.organization' $PROJECT_CONFIG)
REPO=$(jq -r '.repository' $PROJECT_CONFIG)

echo "Using: $OWNER/$REPO"
```

Sprint definitions are loaded from `.claude/config/sprints.json`.

### Label Setup

Ensure these labels exist in the repository:
- `Sprint: 0` through `Sprint: 14`
- `gate`
- `task`

Create if missing:
```bash
gh label create "Sprint: 0" --color "0E8A16"
gh label create "gate" --color "D93F0B"
```

---

## Error Handling

- **Auth Failure**: Run `gh auth login` to authenticate
- **Missing Labels**: Auto-create labels if they don't exist
- **Duplicate Issues**: Skip if issue with same title exists
- **Rate Limiting**: Add delays between API calls if needed

---

## Success Criteria

- [ ] All milestones created
- [ ] All task issues created with correct format
- [ ] All gate issues created with checklists
- [ ] All issues assigned to milestones
- [ ] Summary report generated
- [ ] No errors during execution

---

## Example Output

```
## Plan-to-Issues Execution Complete

### Summary
- **Plan Processed:** [plan-document.md]
- **Repository:** [org/repo from config]

### Created Resources

| Sprint | Milestone | Tasks | Gate |
|--------|-----------|-------|------|
| Sprint 0 | Sprint 0: Foundation | 16 | #N |
| Sprint 1 | Sprint 1: [Name] | N | #N |
| ... | ... | ... | ... |

### Totals
- **Milestones:** [count]
- **Task Issues:** [count]
- **Gate Issues:** [count]
- **Total Issues:** [count]

### Links
- [View Milestones](https://github.com/{org}/{repo}/milestones)
- [View All Issues](https://github.com/{org}/{repo}/issues)
```
