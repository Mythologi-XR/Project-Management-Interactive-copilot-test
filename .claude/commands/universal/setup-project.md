---
description: Set up GitHub project management from an architecture plan (config, milestones, issues, labels)
argument-hint: [plan-file-path]
---

Automate complete GitHub project setup from an architecture plan document.

## IMPORTANT: Use GitHub CLI Only

**ALWAYS use the GitHub CLI (`gh`) for all GitHub operations.** Do NOT use MCP tools (like `mcp__github__*`) for this workflow. The GitHub CLI provides more reliable and consistent behavior for repository creation, issue management, and project board operations.

## Step 0: Verify GitHub CLI Authentication

**BEFORE proceeding with any workflow steps, execute this check:**

```bash
gh auth status
```

**If authentication fails, STOP and display these remediation steps:**

1. Run `gh auth login` to authenticate
2. For project board operations, also run: `gh auth refresh -s project`
3. Re-run `/universal:setup-project` after authentication succeeds

**Only proceed to Step 1 if authentication is successful.**

---

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/universal/setup-project/SKILL.md

## Overview

This command performs the **complete project management setup** in one step:

```
Architecture Plan → Config Files → Labels → Milestones → Issues → Project Board
```

### What It Creates

1. **Config Files** - Auto-generates `.claude/config/` files from GitHub API
2. **Labels** - Creates all sprint and type labels
3. **Milestones** - Creates milestone for each sprint
4. **Issues** - Creates all task and gate issues
5. **Project Board** - Adds issues to project board (if configured)

---

## Usage

```bash
/setup-project path/to/architecture-plan.md
```

### Required Arguments

| Argument | Description |
|----------|-------------|
| `plan-file-path` | Path to the architecture plan document |

### Interactive Prompts

The command will prompt for any missing information:

1. **Organization** - GitHub org (auto-detected from git remote if possible)
2. **Repository** - Repo name (auto-detected from git remote if possible)
3. **Project Number** - GitHub Project V2 number (optional, for Kanban board)

---

## Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 0: VERIFY AUTHENTICATION                   │
│  • Run `gh auth status`                                              │
│  • HALT if not authenticated (provide remediation steps)             │
└────────────────────────────┬────────────────────────────────────────┘
                             │ (success)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 1: DETECT REPOSITORY                       │
│  • Parse git remote to get org/repo                                  │
│  • Prompt if not auto-detectable                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 2: PARSE ARCHITECTURE PLAN                 │
│  • Extract sprint names and numbers                                  │
│  • Extract tasks per sprint                                          │
│  • Extract acceptance criteria                                       │
│  • Extract agent mappings (if present)                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 3: DISCOVER PROJECT IDS (Optional)         │
│  • Query GitHub API for project board IDs                            │
│  • Get status field and column option IDs                            │
│  • Skip if no project number provided                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 4: GENERATE CONFIG FILES                   │
│  • Create .claude/config/project-board.json                          │
│  • Create .claude/config/sprints.json                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 5: CREATE LABELS                           │
│  • Create "Sprint: N" labels for each sprint                         │
│  • Create type labels (gate, task, security, etc.)                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 6: CREATE MILESTONES                       │
│  • Create milestone for each sprint                                  │
│  • Set milestone descriptions                                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 7: CREATE ISSUES                           │
│  • Create task issues with full templates                            │
│  • Create gate issues for each sprint                                │
│  • Assign labels and milestones                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 8: ADD TO PROJECT BOARD (Optional)         │
│  • Add all issues to project board                                   │
│  • Set initial status to "Todo"                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 9: GENERATE SUMMARY                        │
│  • Output creation statistics                                        │
│  • Provide quick links                                               │
│  • Show next steps                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required

- **GitHub CLI (`gh`)** authenticated with `repo` scope - This is the ONLY tool to use for GitHub operations
- **Architecture Plan** document with sprint/task structure

### Optional

- **GitHub Project V2** created (for Kanban board integration)
- **Project scope** on GitHub token: `gh auth refresh -s project`

### Tool Selection

| Operation | Use This | NOT This |
|-----------|----------|----------|
| Create repository | `gh repo create` | `mcp__github__create_repository` |
| Create issues | `gh issue create` | `mcp__github__create_issue` |
| Create labels | `gh label create` | MCP tools |
| GraphQL queries | `gh api graphql` | MCP tools |
| All GitHub ops | GitHub CLI (`gh`) | Any MCP tools |

---

## Plan Document Requirements

The architecture plan must contain:

### Sprint Structure

```markdown
## Sprint N: Sprint Name

### Tasks
1. **Task Name** - Description
   - Step 1
   - Step 2
```

### Acceptance Criteria (per sprint)

```markdown
### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

### Agent Mapping (optional)

If included, associates tasks with AI agents:

```markdown
| Sprint | Task | Agent | Skill File |
|--------|------|-------|------------|
| 0 | 1 | typescript-setup | typescript-setup/SKILL.md |
```

---

## Example Session

```
$ /setup-project docs/site-refactor/ARCHITECTURE-OPTIMIZATION-PLAN_v4.md

## Setup Project from Architecture Plan

### Step 1: Repository Detection
✓ Detected: Mythologi-XR/elysium-web-app

### Step 2: Parsing Plan
✓ Found 15 sprints
✓ Found 82 tasks
✓ Found agent mappings

### Step 3: Project Board (Optional)
? Enter GitHub Project number (or press Enter to skip): 4
✓ Found project: ELYSIUM | Web-App Integration
✓ Retrieved column IDs

### Step 4: Generating Config Files
✓ Created .claude/config/project-board.json
✓ Created .claude/config/sprints.json

### Step 5: Creating Labels
✓ Created 15 sprint labels
✓ Created 5 type labels

### Step 6: Creating Milestones
✓ Created 15 milestones

### Step 7: Creating Issues
✓ Created 82 task issues
✓ Created 15 gate issues

### Step 8: Adding to Project Board
✓ Added 97 issues to project board

---

## Setup Complete!

### Summary
- **Config Files:** 2
- **Labels:** 20
- **Milestones:** 15
- **Task Issues:** 82
- **Gate Issues:** 15
- **Total Issues:** 97

### Quick Links
- [Project Board](https://github.com/orgs/Mythologi-XR/projects/4)
- [All Issues](https://github.com/Mythologi-XR/elysium-web-app/issues)
- [Milestones](https://github.com/Mythologi-XR/elysium-web-app/milestones)

### Next Steps
1. Review the generated config files
2. Start Sprint 0: `/phase 0`
```

---

## Generated Config Files

### project-board.json

```json
{
  "organization": "Mythologi-XR",
  "repository": "elysium-web-app",
  "project": {
    "number": 4,
    "id": "PVT_kwDOBPMIpc4BJaEC",
    "title": "ELYSIUM | Web-App Integration"
  },
  "fields": {
    "status": {
      "id": "PVTSSF_lADOBPMIpc4BJaECzg5lG-Q",
      "name": "Status"
    }
  },
  "columns": {
    "todo": { "id": "f75ad846", "name": "Todo" },
    "in_progress": { "id": "47fc9ee4", "name": "In Progress" },
    "testing": { "id": "1aac3a13", "name": "Testing | Validating" },
    "review": { "id": "24c81447", "name": "Review" },
    "done": { "id": "98236657", "name": "Done" }
  }
}
```

### sprints.json

```json
{
  "validation": {
    "commands": ["npm run build", "npm run lint"],
    "optional_commands": ["npx tsc --noEmit", "npm run test"]
  },
  "workflow": {
    "require_human_review": true,
    "auto_close_on_done": false,
    "comment_on_transitions": true
  },
  "sprints": [
    {
      "number": 0,
      "name": "Foundation",
      "milestone": "Sprint 0: Foundation",
      "gate_issue_suffix": ".G",
      "description": "TypeScript, security, React 19, infrastructure"
    }
  ]
}
```

---

## Error Handling

| Error | Solution |
|-------|----------|
| "Not authenticated" | Run `gh auth login` |
| "Repository not found" | Check org/repo names |
| "Project not found" | Verify project number exists |
| "Rate limited" | Wait and retry, or skip project board |
| "Missing plan sections" | Ensure plan has required sprint/task structure |

---

## Idempotency

The command is **partially idempotent**:

- **Config files**: Overwrites if exists (with confirmation)
- **Labels**: Creates only if not exists (`--force`)
- **Milestones**: Skips if exists with same name
- **Issues**: Skips if issue with same title exists
- **Project board**: Adds only issues not already in project

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/phase [N]` | Execute sprint N after setup |
| `/plan-to-issues` | Alternative: just create issues (no config) |
| `/status` | Check project progress |

---

## Related Skills

- Setup Skill: `.claude/skills/universal/setup-project/SKILL.md`
- Plan Parser: `.claude/skills/universal/plan-to-issues/PARSER.md`
- GitHub Project: `.claude/skills/universal/github-project/SKILL.md`
