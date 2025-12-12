# Plan-to-Issues Skill

> Automated GitHub issue generation from architecture optimization plans

## Overview

This skill enables automated creation of GitHub issues, milestones, and gates from a structured architecture plan document. It orchestrates the full workflow of parsing plans, creating resources, and generating summary reports.

## Prerequisites

- GitHub CLI (`gh`) authenticated with `repo` scope
- Access to target repository
- Plan document in expected format

## Skill Files

| File | Purpose |
|------|---------|
| SKILL.md | Main skill documentation (this file) |
| PARSER.md | Plan document parsing logic |
| TEMPLATES.md | Issue and gate templates |
| GITHUB-API.md | GitHub CLI commands and API calls |

---

## Workflow

```
┌─────────────────┐
│  1. Parse Plan  │
│  (PARSER.md)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Load Agent   │
│    Mapping      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Create       │
│    Milestones   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Create Task  │
│    Issues       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Create Gate  │
│    Issues       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. Assign to    │
│    Milestones   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 7. Generate     │
│    Summary      │
└─────────────────┘
```

---

## Step 1: Parse Plan Document

See: @PARSER.md

Extract from the plan document:

### Sprint Structure
```
Sprint N: Sprint Name (Duration)
```

### Task Structure
```
Task N.M: Task Name
- Description
- Subtasks/steps
- Acceptance criteria
```

### Expected Plan Sections
- Sprint overview table
- Per-sprint task lists
- Acceptance criteria per sprint
- Sprint gate requirements

---

## Step 2: Load Agent Mapping

Read the agent mapping document to associate:
- Tasks → Primary agents
- Tasks → Skill files
- Tasks → Required tools

Agent mapping format:
```
| Sprint | Task | Agent | Skill File |
|--------|------|-------|------------|
| 0 | TypeScript Setup | typescript-setup | typescript-setup/SKILL.md |
```

---

## Step 3: Create Milestones

See: @GITHUB-API.md

For each sprint, create a milestone:

```bash
gh api repos/{owner}/{repo}/milestones \
  --method POST \
  -f title="Sprint N: Sprint Name" \
  -f state="open" \
  -f description="Sprint N objectives and deliverables"
```

Store milestone numbers for later assignment.

---

## Step 4: Create Task Issues

See: @TEMPLATES.md

For each task, create an issue with:

1. **Title**: `SprintN.ID - Task Name`
2. **Body**: Full template with:
   - Objective
   - Checklist
   - Acceptance criteria
   - Validation commands
   - Agent/skill references
   - Related issues
3. **Labels**: `Sprint: N`

```bash
gh issue create \
  --repo {owner}/{repo} \
  --title "Sprint0.1 - TypeScript Installation" \
  --body "$(cat <<'EOF'
## Objective
...
EOF
)" \
  --label "Sprint: 0"
```

---

## Step 5: Create Gate Issues

See: @TEMPLATES.md

For each sprint, create a gate issue:

1. **Title**: `SprintN.G - Sprint N Gate`
2. **Body**: Gate template with:
   - Pre-gate checklist
   - Validation commands
   - Sprint-specific criteria
   - Sign-off section
   - Related task issues
3. **Labels**: `Sprint: N`, `gate`

---

## Step 6: Assign to Milestones

After all issues are created, assign them to milestones:

```bash
# Get issue numbers for each sprint
# Assign to corresponding milestone
gh issue edit {issue_number} \
  --repo {owner}/{repo} \
  --milestone "Sprint N: Name"
```

Use parallel execution for efficiency:
```bash
for i in {start..end}; do
  gh issue edit $i --milestone "Sprint N: Name" &
done
wait
```

---

## Step 7: Generate Summary

Output a formatted report:

```markdown
## Plan-to-Issues Execution Complete

### Summary
- **Plan Processed:** [filename]
- **Repository:** [owner/repo]
- **Execution Time:** [duration]

### Created Resources

| Sprint | Milestone | Tasks | Gate Issue |
|--------|-----------|-------|------------|
| 0 | Sprint 0: Foundation | 16 | #115 |
| 1 | Sprint 1: Atoms | 4 | #116 |
...

### Totals
- **Milestones:** N
- **Task Issues:** N
- **Gate Issues:** N
- **Total Issues:** N

### Quick Links
- [Milestones](https://github.com/{owner}/{repo}/milestones)
- [All Issues](https://github.com/{owner}/{repo}/issues)
- [Sprint 0 Issues](https://github.com/{owner}/{repo}/issues?q=label:"Sprint:+0")
```

---

## Error Handling

### Authentication Errors
```bash
# Check auth status
gh auth status

# Re-authenticate if needed
gh auth login
```

### Rate Limiting
Add delays between API calls:
```bash
sleep 0.5  # 500ms delay between issue creations
```

### Duplicate Prevention
Check for existing issues before creating:
```bash
existing=$(gh issue list --repo {owner}/{repo} --search "Sprint0.1" --json number --jq '.[0].number')
if [ -z "$existing" ]; then
  # Create issue
fi
```

### Missing Labels
Auto-create labels if they don't exist:
```bash
gh label create "Sprint: 0" --color "0E8A16" --force 2>/dev/null || true
```

---

## Configuration Options

### Configuration Files

This skill reads from project config files for org/repo information:

```bash
# Load from config files
PROJECT_CONFIG=".claude/config/project-board.json"
SPRINT_CONFIG=".claude/config/sprints.json"

# Read org/repo dynamically
GITHUB_OWNER=$(jq -r '.organization' $PROJECT_CONFIG)
GITHUB_REPO=$(jq -r '.repository' $PROJECT_CONFIG)
```

### Command Arguments

The plan file path is passed as an argument to the `/plan-to-issues` command:

```bash
# Example usage
/plan-to-issues docs/site-refactor/ARCHITECTURE-OPTIMIZATION-PLAN_v4.md
```

### Issue Numbering
- Task IDs are sequential within sprints: `Sprint0.1`, `Sprint0.2`, ...
- Gate IDs use `.G` suffix: `Sprint0.G`

### Label Colors
```
Sprint: 0  → #0E8A16 (green)
Sprint: 1  → #1D76DB (blue)
...
gate       → #D93F0B (red)
task       → #5319E7 (purple)
```

---

## Validation

After execution, verify:

```bash
# Count milestones
gh api repos/{owner}/{repo}/milestones --jq 'length'

# Count issues per milestone
gh api repos/{owner}/{repo}/milestones \
  --jq '.[] | "\(.title): \(.open_issues) issues"'

# Verify all issues assigned
gh issue list --repo {owner}/{repo} \
  --json number,milestone \
  --jq '.[] | select(.milestone == null) | .number'
```

---

## Related Files

- Project Config: `.claude/config/project-board.json`
- Sprint Config: `.claude/config/sprints.json`
- GitHub Project Skill: `.claude/skills/universal/github-project/SKILL.md`
- Sprint Runner Skill: `.claude/skills/universal/sprint-runner/SKILL.md`
- Plan-to-Issues Command: `.claude/commands/plan-to-issues.md`
