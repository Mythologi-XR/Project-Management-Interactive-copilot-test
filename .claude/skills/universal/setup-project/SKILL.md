# Setup Project Skill

> Automated GitHub project management setup from architecture plans

## CRITICAL: GitHub CLI Only

**ALWAYS use the GitHub CLI (`gh`) for ALL GitHub operations in this workflow.**

Do NOT use:
- MCP tools (`mcp__github__*`)
- Direct API calls without `gh`
- Any other GitHub integration tools

The GitHub CLI is the only supported method because:
1. It handles authentication consistently
2. It works reliably across all environments
3. It supports all required operations (repos, issues, labels, projects, GraphQL)

```bash
# First step: Always verify authentication
gh auth status
```

---

## Overview

This skill orchestrates the complete project management setup workflow:

1. Detect repository from git remote
2. Parse architecture plan document
3. **Project board setup** (NEW - one of three options):
   - **Create new** → Automatically create GitHub Project V2 with columns
   - **Use existing** → Discover IDs from existing project
   - **Skip** → No project board integration
4. Generate config files
5. Create labels
6. Create milestones
7. Create issues (tasks + gates)
8. Add to project board (if configured)

---

## Prerequisites

- **GitHub CLI (`gh`)** authenticated with `repo` scope - REQUIRED, no alternatives
- For project board integration: `gh auth refresh -s project`

### GitHub CLI Commands Used

| Operation | Command |
|-----------|---------|
| Check auth | `gh auth status` |
| Create repo | `gh repo create` |
| Create label | `gh label create` |
| Create issue | `gh issue create` |
| Edit issue | `gh issue edit` |
| View issue | `gh issue view` |
| List issues | `gh issue list` |
| Comment on issue | `gh issue comment` |
| Create project | `gh project create` |
| REST API | `gh api repos/OWNER/REPO/...` |
| GraphQL API | `gh api graphql -f query='...'` |

---

## Step 1: Detect Repository

### From Git Remote

```bash
# Get origin URL
git_url=$(git remote get-url origin 2>/dev/null)

# Parse org/repo from SSH URL
# git@github.com:Org/Repo.git → Org/Repo
if [[ $git_url == git@github.com:* ]]; then
  org_repo=${git_url#git@github.com:}
  org_repo=${org_repo%.git}
  OWNER=${org_repo%/*}
  REPO=${org_repo#*/}
fi

# Parse org/repo from HTTPS URL
# https://github.com/Org/Repo.git → Org/Repo
if [[ $git_url == https://github.com/* ]]; then
  org_repo=${git_url#https://github.com/}
  org_repo=${org_repo%.git}
  OWNER=${org_repo%/*}
  REPO=${org_repo#*/}
fi

echo "Detected: $OWNER/$REPO"
```

### Fallback: Prompt User

If auto-detection fails, prompt for:
- Organization name
- Repository name

---

## Step 2: Parse Architecture Plan

Use the parser from: `.claude/skills/universal/plan-to-issues/PARSER.md`

### Extract Sprint Information

```regex
^##\s+Sprint\s+(\d+):\s+(.+?)(?:\s+\((.+?)\))?$
```

Captures:
- Sprint number
- Sprint name
- Duration (optional)

### Extract Tasks

```regex
^\d+\.\s+\*\*(.+?)\*\*
```

Or task headers:
```regex
^####?\s+Task\s+(\d+)\.(\d+):\s+(.+)$
```

### Extract Acceptance Criteria

```regex
^-\s+\[[ x]\]\s+(.+)$
```

### Output Structure

```typescript
interface ParsedPlan {
  sprints: {
    number: number;
    name: string;
    description: string;
    tasks: {
      id: string;        // "Sprint0.1"
      name: string;
      steps: string[];
      acceptanceCriteria: string[];
      agent?: string;
      skillFile?: string;
    }[];
    acceptanceCriteria: string[];
  }[];
}
```

---

## Step 3: Project Board Setup

This step offers three options to the user:

### Option A: Create New Project Board (Recommended)

Use the `github-project-creator` agent to automatically create a fully configured project board.

```bash
# Prompt user
echo "Project Board Setup:"
echo "  1. Create new project board (recommended)"
echo "  2. Use existing project board"
echo "  3. Skip project board integration"
read -p "Select option [1-3]: " PROJECT_OPTION
```

If user selects "Create new":

```bash
# Spawn github-project-creator agent with parameters:
# - OWNER: Organization or user name
# - REPO: Repository name
# - PROJECT_TITLE: Suggested title (e.g., "{REPO} | Sprint Management")

# The agent will:
# 1. Detect owner type (user vs organization)
# 2. Get repository node ID for linking
# 3. Create project: gh project create --owner $OWNER --title "$PROJECT_TITLE"
# 4. Query existing Status field ID (default field)
# 5. Update Status field with 5 custom columns via GraphQL:
#    - updateProjectV2Field mutation with singleSelectOptions
#    - Columns: Todo (Gray), In Progress (Blue), Testing|Validating (Yellow), Review (Orange), Done (Green)
# 6. Link project to repository via GraphQL:
#    - linkProjectV2ToRepository mutation
# 7. Query all IDs for config
# 8. Generate .claude/config/project-board.json
```

**Key Implementation Details:**

The default Status field already exists on new projects. Instead of creating a new field (which fails with "Name already taken"), we **update** the existing field:

```bash
# Update existing Status field with custom options
gh api graphql -f query='
  mutation($fieldId: ID!) {
    updateProjectV2Field(input: {
      fieldId: $fieldId
      singleSelectOptions: [
        {name: "Todo", color: GRAY, description: "Tasks queued for sprint"}
        {name: "In Progress", color: BLUE, description: "Actively being worked on"}
        {name: "Testing | Validating", color: YELLOW, description: "Running automated checks"}
        {name: "Review", color: ORANGE, description: "Ready for human review"}
        {name: "Done", color: GREEN, description: "Approved and complete"}
      ]
    }) {
      projectV2Field { ... }
    }
  }' -f fieldId="$STATUS_FIELD_ID"
```

To link the project to the repository:

```bash
# Link project to repository
gh api graphql -f query='
  mutation($projectId: ID!, $repoId: ID!) {
    linkProjectV2ToRepository(input: {
      projectId: $projectId
      repositoryId: $repoId
    }) {
      repository { name }
    }
  }' -f projectId="$PROJECT_ID" -f repoId="$REPO_ID"
```

Agent file: `.claude/agents/universal/github-project-creator.md`

**Note:** GitHub's API does not support creating project board *views* programmatically. The Kanban board view must be created manually via the web UI after project creation. The setup summary will include instructions for this step.

### Option B: Use Existing Project Board

Discover IDs from an existing project (original behavior).

```bash
# Prompt for project number
read -p "Enter GitHub Project number: " PROJECT_NUMBER

# Query project board
gh api graphql -f query='
{
  organization(login: "'"$OWNER"'") {
    projectV2(number: '"$PROJECT_NUMBER"') {
      id
      title
      fields(first: 20) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id
            name
            options {
              id
              name
            }
          }
        }
      }
    }
  }
}'
```

### Option C: Skip Project Board

Continue without project board integration. Issues will be created but not added to a Kanban board.

```bash
echo "Skipping project board integration."
echo "Issues will be created but not added to a project board."
echo "You can add them later using: /phase [sprint-number]"
```

### Parse Response (Option B only)

Extract:
- `project.id` → Project ID
- `project.title` → Project title
- `fields.nodes[name="Status"].id` → Status field ID
- `fields.nodes[name="Status"].options` → Column IDs

### Map Column Names

Standard column mapping:
```
"Todo" → columns.todo
"In Progress" → columns.in_progress
"Testing | Validating" OR "Testing" → columns.testing
"Review" → columns.review
"Done" → columns.done
```

---

## Step 4: Generate Config Files

### Create Directory

```bash
mkdir -p .claude/config
```

### Generate project-board.json

```bash
cat > .claude/config/project-board.json << EOF
{
  "organization": "$OWNER",
  "repository": "$REPO",
  "project": {
    "number": $PROJECT_NUMBER,
    "id": "$PROJECT_ID",
    "title": "$PROJECT_TITLE"
  },
  "fields": {
    "status": {
      "id": "$STATUS_FIELD_ID",
      "name": "Status"
    }
  },
  "columns": {
    "todo": { "id": "$TODO_ID", "name": "Todo" },
    "in_progress": { "id": "$IN_PROGRESS_ID", "name": "In Progress" },
    "testing": { "id": "$TESTING_ID", "name": "Testing | Validating" },
    "review": { "id": "$REVIEW_ID", "name": "Review" },
    "done": { "id": "$DONE_ID", "name": "Done" }
  }
}
EOF
```

### Generate sprints.json

```bash
# Build sprints array from parsed plan
sprints_json=$(echo "$parsed_sprints" | jq -c '[.[] | {
  number: .number,
  name: .name,
  milestone: ("Sprint " + (.number|tostring) + ": " + .name),
  gate_issue_suffix: ".G",
  description: .description
}]')

cat > .claude/config/sprints.json << EOF
{
  "validation": {
    "commands": ["npm run build", "npm run lint"],
    "optional_commands": ["npx tsc --noEmit", "npm run test:run"]
  },
  "workflow": {
    "require_human_review": true,
    "auto_close_on_done": false,
    "comment_on_transitions": true,
    "confirmation_mode": "interactive",
    "confirmation_prompts": {
      "sprint_start": true,
      "task_start": true,
      "task_completion": true,
      "sprint_completion": true
    },
    "user_ready_signals": ["ready", "next", "continue", "done", "yes", "y"],
    "user_hold_signals": ["hold", "wait", "stop", "no", "n", "pause"],
    "resumption_signals": ["resume", "restart"],
    "compaction": {
      "auto_trigger_after_tasks": 3,
      "manual_trigger": "compact",
      "skip_signal": "skip compact"
    }
  },
  "sprints": $sprints_json
}
EOF
```

### Interactive Workflow Configuration

The `sprints.json` includes all fields required by the 14-Step Interactive Sprint Workflow:

| Field | Purpose |
|-------|---------|
| `confirmation_mode` | Set to "interactive" to enable user confirmation at each phase |
| `confirmation_prompts` | Controls which workflow phases require user confirmation |
| `user_ready_signals` | Signals that indicate user is ready to proceed (yes, ready, next, etc.) |
| `user_hold_signals` | Signals that indicate user wants to pause (no, hold, wait, etc.) |
| `resumption_signals` | Signals for Step 0 sprint resumption (resume, restart) |
| `compaction` | Context compaction settings for long sprints |

#### Compaction Settings

The `compaction` object controls automatic context compaction during long sprints:

- `auto_trigger_after_tasks`: Number of tasks before auto-prompting compaction (default: 3)
- `manual_trigger`: Signal to manually trigger compaction ("compact")
- `skip_signal`: Signal to skip compaction ("skip compact")

**Recommended values for `auto_trigger_after_tasks`:**

| Sprint Type | Value | Rationale |
|-------------|-------|-----------|
| Complex (Sprint 0, 11-12) | `1` or `2` | High context per task |
| Standard (most sprints) | `3` | Balanced default |
| Simple (atoms, badges) | `3+` | Low context per task |

---

## Step 5: Create Labels

### Sprint Labels

```bash
# Color palette for sprints
colors=(
  "0E8A16" "1D76DB" "0052CC" "5319E7" "7057FF"
  "008672" "00B4D8" "0077B6" "023E8A" "03045E"
  "6A0572" "A4133C" "C9184A" "FF4D6D" "D00000"
)

for i in $(seq 0 $MAX_SPRINT); do
  color=${colors[$i % ${#colors[@]}]}
  gh label create "Sprint: $i" \
    --repo "$OWNER/$REPO" \
    --color "$color" \
    --force 2>/dev/null || true
done
```

### Type Labels

```bash
gh label create "gate" --color "D93F0B" --description "Sprint gate verification" --force
gh label create "task" --color "5319E7" --description "Implementation task" --force
gh label create "security" --color "B60205" --description "Security-related" --force
gh label create "typescript" --color "3178C6" --description "TypeScript migration" --force
gh label create "react19" --color "61DAFB" --description "React 19 features" --force
```

---

## Step 6: Create Milestones

```bash
for sprint in "${sprints[@]}"; do
  number=$(echo "$sprint" | jq -r '.number')
  name=$(echo "$sprint" | jq -r '.name')
  description=$(echo "$sprint" | jq -r '.description')

  gh api "repos/$OWNER/$REPO/milestones" \
    --method POST \
    -f title="Sprint $number: $name" \
    -f state="open" \
    -f description="$description" \
    2>/dev/null || echo "Milestone exists: Sprint $number"
done
```

---

## Step 7: Create Issues

### Task Issues

Use templates from: `.claude/skills/universal/plan-to-issues/TEMPLATES.md`

```bash
for task in "${tasks[@]}"; do
  sprint_num=$(echo "$task" | jq -r '.sprint')
  task_num=$(echo "$task" | jq -r '.number')
  task_name=$(echo "$task" | jq -r '.name')

  # Build issue body from template
  body=$(render_task_template "$task")

  # Create issue
  gh issue create \
    --repo "$OWNER/$REPO" \
    --title "Sprint${sprint_num}.${task_num} - ${task_name}" \
    --body "$body" \
    --label "Sprint: $sprint_num" \
    --milestone "Sprint $sprint_num: $sprint_name"
done
```

### Gate Issues

```bash
for sprint in "${sprints[@]}"; do
  number=$(echo "$sprint" | jq -r '.number')
  name=$(echo "$sprint" | jq -r '.name')

  # Build gate body from template
  body=$(render_gate_template "$sprint" "$tasks")

  # Create gate issue
  gh issue create \
    --repo "$OWNER/$REPO" \
    --title "Sprint${number}.G - Sprint $number Gate" \
    --body "$body" \
    --label "Sprint: $number,gate" \
    --milestone "Sprint $number: $name"
done
```

---

## Step 8: Add to Project Board (Optional)

If project board config exists:

```bash
# Read config
PROJECT_ID=$(jq -r '.project.id' .claude/config/project-board.json)
STATUS_FIELD_ID=$(jq -r '.fields.status.id' .claude/config/project-board.json)
TODO_ID=$(jq -r '.columns.todo.id' .claude/config/project-board.json)

# Get all issues
issues=$(gh issue list --repo "$OWNER/$REPO" --state open --json number,id --limit 500)

# Add each to project
for issue_id in $(echo "$issues" | jq -r '.[].id'); do
  # Add to project
  item_id=$(gh api graphql -f query='
    mutation {
      addProjectV2ItemById(input: {
        projectId: "'"$PROJECT_ID"'"
        contentId: "'"$issue_id"'"
      }) {
        item { id }
      }
    }' --jq '.data.addProjectV2ItemById.item.id')

  # Set to Todo column
  gh api graphql -f query='
    mutation {
      updateProjectV2ItemFieldValue(input: {
        projectId: "'"$PROJECT_ID"'"
        itemId: "'"$item_id"'"
        fieldId: "'"$STATUS_FIELD_ID"'"
        value: { singleSelectOptionId: "'"$TODO_ID"'" }
      }) {
        projectV2Item { id }
      }
    }'
done
```

---

## Step 9: Generate Summary

```markdown
## Setup Complete!

### Summary
- **Repository:** {owner}/{repo}
- **Project Board:** Created (#X) with 5 status columns
- **Repository Linked:** Yes
- **Config Files:** 2 created
- **Labels:** {label_count} created
- **Milestones:** {milestone_count} created
- **Task Issues:** {task_count} created
- **Gate Issues:** {gate_count} created
- **Total Issues:** {total_count}

### Quick Links
- [Project Board](https://github.com/orgs/{owner}/projects/{number})
- [All Issues](https://github.com/{owner}/{repo}/issues)
- [Milestones](https://github.com/{owner}/{repo}/milestones)

### Next Steps
1. Review config files in `.claude/config/`
2. **Enable Kanban board view** (one-time manual step):
   - Open the project board link above
   - Click the view dropdown or "+ New view"
   - Select "Board" layout
   - The board will use your 5 Status columns automatically
3. Start Sprint 0: `/phase 0`
```

---

## Error Handling

### Authentication Errors

```bash
if ! gh auth status &>/dev/null; then
  echo "Error: Not authenticated. Run: gh auth login"
  exit 1
fi
```

### Missing Project Scope

```bash
if ! gh api graphql -f query='{viewer{login}}' &>/dev/null; then
  echo "Error: Missing project scope. Run: gh auth refresh -s project"
  exit 1
fi
```

### Rate Limiting

```bash
# Add delays between bulk operations
sleep 0.5
```

### Duplicate Detection

```bash
# Check if issue exists before creating
existing=$(gh issue list --repo "$OWNER/$REPO" --search "$title" --json number --jq '.[0].number')
if [ -n "$existing" ]; then
  echo "Issue exists: #$existing"
  continue
fi
```

---

## Idempotency Notes

| Resource | Behavior |
|----------|----------|
| Config files | Overwrites (with backup) |
| Labels | Creates if not exists (`--force`) |
| Milestones | Skips if exists |
| Issues | Skips if title matches |
| Project items | Skips if already added |

---

## Agent Orchestration

The `/setup-project` command can leverage universal agents for improved speed and parallel execution.

### Available Agents

| Step | Agent | Purpose | Tools |
|------|-------|---------|-------|
| 2 | `plan-parser` | Parse architecture plan → JSON | Read, Grep, Glob |
| 3 | `github-project-creator` | **Create new project board** (NEW) | Bash, Read |
| 5 | `github-label-creator` | Create sprint + type labels | Bash, Read |
| 6 | `github-milestone-creator` | Create milestones | Bash, Read |
| 7 | `github-issue-creator` | Create task + gate issues | Bash, Read |
| 8 | `github-project-populator` | Add issues to project board | Bash, Read |

### Parallel Execution Strategy

For maximum speed, run these in parallel:

```
┌─────────────────────────────────────────────────────────────┐
│  Sequential: Steps 1-4 (repo detection, config generation)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Parallel: Labels + Milestones (Steps 5-6)                   │
│  ├── github-label-creator                                    │
│  └── github-milestone-creator                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Parallel: Issue Creation (Step 7) - 3x agents               │
│  ├── github-issue-creator (Sprints 0-4)                      │
│  ├── github-issue-creator (Sprints 5-9)                      │
│  └── github-issue-creator (Sprints 10-14)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Sequential: Project Board Population (Step 8)               │
│  └── github-project-populator                                │
└─────────────────────────────────────────────────────────────┘
```

### Agent Files

All agents are located in `.claude/agents/universal/`:

- `plan-parser.md` - Parse architecture documents
- `github-project-creator.md` - **Create new GitHub Project V2** (NEW)
- `github-label-creator.md` - Create GitHub labels
- `github-milestone-creator.md` - Create milestones
- `github-issue-creator.md` - Create issues (parallelizable)
- `github-project-populator.md` - Populate project board

### Speed Improvements

| Mode | Estimated Time (100 issues) |
|------|----------------------------|
| Sequential | ~8-10 minutes |
| With Agents (Parallel) | ~3-4 minutes |

---

## Related Files

- Command: `.claude/commands/universal/setup-project.md`
- Plan Parser: `.claude/skills/universal/plan-to-issues/PARSER.md`
- Issue Templates: `.claude/skills/universal/plan-to-issues/TEMPLATES.md`
- GitHub API: `.claude/skills/universal/plan-to-issues/GITHUB-API.md`
- GitHub Project: `.claude/skills/universal/github-project/SKILL.md`
- Sprint Runner: `.claude/skills/universal/sprint-runner/SKILL.md`
- Config: `.claude/config/project-board.json`
- Config: `.claude/config/sprints.json`

### Agent Files

- Plan Parser: `.claude/agents/universal/plan-parser.md`
- Label Creator: `.claude/agents/universal/github-label-creator.md`
- Milestone Creator: `.claude/agents/universal/github-milestone-creator.md`
- Issue Creator: `.claude/agents/universal/github-issue-creator.md`
- Project Populator: `.claude/agents/universal/github-project-populator.md`
