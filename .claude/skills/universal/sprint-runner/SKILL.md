# Sprint Runner Skill

> Universal skill for orchestrating sprint execution with GitHub Project board integration

## Overview

This skill manages the execution of sprints in a Kanban workflow. It is **project-agnostic** and works with any repository that has:

1. A project board config (`.claude/config/project-board.json`)
2. A sprint config (`.claude/config/sprints.json`)
3. GitHub issues organized by milestones

## Configuration Files

### Project Board Config

See: `.claude/skills/universal/github-project/SKILL.md`

Location: `.claude/config/project-board.json`

### Sprint Config

Location: `.claude/config/sprints.json`

```json
{
  "validation": {
    "commands": [
      "npm run build",
      "npm run lint",
      "npx tsc --noEmit"
    ],
    "optional_commands": [
      "npm run test:run"
    ]
  },
  "sprints": [
    {
      "number": 0,
      "name": "Foundation",
      "milestone": "Sprint 0: Foundation",
      "gate_issue_suffix": ".G"
    },
    {
      "number": 1,
      "name": "Atoms - Buttons & Badges",
      "milestone": "Sprint 1: Atoms - Buttons & Badges",
      "gate_issue_suffix": ".G"
    }
  ],
  "workflow": {
    "require_human_review": true,
    "auto_close_on_done": false,
    "comment_on_transitions": true
  }
}
```

---

## Sprint Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                     SPRINT INITIALIZATION                        │
│  1. Load sprint config                                           │
│  2. Get issues from milestone                                    │
│  3. Add all issues to project board                              │
│  4. Move all issues to "Todo" column                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     TASK EXECUTION LOOP                          │
│  For each task (in order):                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ a. Move to "In Progress"                                   │  │
│  │ b. Execute implementation (using designated agent)         │  │
│  │ c. Move to "Testing | Validating"                          │  │
│  │ d. Run validation commands from config                     │  │
│  │ e. Move to "Review" (wait for human)                       │  │
│  │ f. [Human moves to "Done"]                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SPRINT GATE                                  │
│  1. Verify all tasks in "Done"                                   │
│  2. Run gate verification commands                               │
│  3. Move gate issue to "Review"                                  │
│  4. [Human approves gate → "Done"]                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Core Functions

### Load Configuration

```bash
load_config() {
  PROJECT_CONFIG=".claude/config/project-board.json"
  SPRINT_CONFIG=".claude/config/sprints.json"

  # Project board config
  ORG=$(jq -r '.organization' $PROJECT_CONFIG)
  REPO=$(jq -r '.repository' $PROJECT_CONFIG)
  PROJECT_ID=$(jq -r '.project.id' $PROJECT_CONFIG)
  PROJECT_NUM=$(jq -r '.project.number' $PROJECT_CONFIG)
  STATUS_FIELD=$(jq -r '.fields.status.id' $PROJECT_CONFIG)

  # Column IDs
  TODO_ID=$(jq -r '.columns.todo.id' $PROJECT_CONFIG)
  IN_PROGRESS_ID=$(jq -r '.columns.in_progress.id' $PROJECT_CONFIG)
  TESTING_ID=$(jq -r '.columns.testing.id' $PROJECT_CONFIG)
  REVIEW_ID=$(jq -r '.columns.review.id' $PROJECT_CONFIG)
  DONE_ID=$(jq -r '.columns.done.id' $PROJECT_CONFIG)

  # Validation commands
  VALIDATION_CMDS=$(jq -r '.validation.commands[]' $SPRINT_CONFIG)
}
```

### Get Sprint Info

```bash
get_sprint_info() {
  local SPRINT_NUM=$1

  SPRINT_NAME=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .name" $SPRINT_CONFIG)
  SPRINT_MILESTONE=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .milestone" $SPRINT_CONFIG)
  GATE_SUFFIX=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .gate_issue_suffix" $SPRINT_CONFIG)
}
```

---

## Phase 1: Sprint Initialization

```bash
init_sprint() {
  local SPRINT_NUM=$1

  load_config
  get_sprint_info $SPRINT_NUM

  echo "Initializing Sprint $SPRINT_NUM: $SPRINT_NAME"

  # Get all issues in milestone
  ISSUES=$(gh issue list \
    --repo $ORG/$REPO \
    --milestone "$SPRINT_MILESTONE" \
    --json number,title \
    --jq '.[].number')

  echo "Found issues: $ISSUES"

  # Move all to Todo
  for issue in $ISSUES; do
    echo "Moving #$issue to Todo..."
    move_to_todo $issue
  done

  echo "Sprint $SPRINT_NUM initialized"
}
```

---

## Phase 2: Task Execution

### Start Task

```bash
start_task() {
  local ISSUE_NUM=$1

  load_config

  echo "Starting task #$ISSUE_NUM..."

  # Move to In Progress
  move_to_in_progress $ISSUE_NUM

  # Add comment if configured
  if [ "$(jq -r '.workflow.comment_on_transitions' $SPRINT_CONFIG)" = "true" ]; then
    gh issue comment $ISSUE_NUM --repo $ORG/$REPO \
      --body "🚀 **Task Started**

Working on this task now."
  fi
}
```

### Complete Implementation

```bash
complete_implementation() {
  local ISSUE_NUM=$1

  load_config

  echo "Implementation complete for #$ISSUE_NUM, moving to testing..."

  # Move to Testing
  move_to_testing $ISSUE_NUM
}
```

### Run Validation

```bash
run_validation() {
  load_config

  echo "Running validation..."

  local ALL_PASSED=true

  # Run each validation command
  while IFS= read -r cmd; do
    echo "Running: $cmd"
    if ! eval "$cmd"; then
      echo "FAILED: $cmd"
      ALL_PASSED=false
    fi
  done <<< "$VALIDATION_CMDS"

  if [ "$ALL_PASSED" = true ]; then
    return 0
  else
    return 1
  fi
}
```

### Submit for Review

```bash
submit_for_review() {
  local ISSUE_NUM=$1
  local VALIDATION_PASSED=$2

  load_config

  if [ "$VALIDATION_PASSED" = "true" ]; then
    # Move to Review
    move_to_review $ISSUE_NUM

    # Add success comment
    if [ "$(jq -r '.workflow.comment_on_transitions' $SPRINT_CONFIG)" = "true" ]; then
      # Build validation results
      local RESULTS=""
      while IFS= read -r cmd; do
        RESULTS="$RESULTS\n- \`$cmd\` ✓"
      done <<< "$VALIDATION_CMDS"

      gh issue comment $ISSUE_NUM --repo $ORG/$REPO \
        --body "✅ **Implementation Complete**

Validation passed:
$RESULTS

Ready for human review."
    fi
  else
    # Stay in Testing, add failure comment
    if [ "$(jq -r '.workflow.comment_on_transitions' $SPRINT_CONFIG)" = "true" ]; then
      gh issue comment $ISSUE_NUM --repo $ORG/$REPO \
        --body "❌ **Validation Failed**

One or more checks failed. Investigating..."
    fi
  fi
}
```

### Full Task Execution

```bash
execute_task() {
  local ISSUE_NUM=$1

  # 1. Start
  start_task $ISSUE_NUM

  # 2. Implementation happens here (via designated agent)
  # ... The calling command/agent does the actual work ...

  # 3. Move to testing
  complete_implementation $ISSUE_NUM

  # 4. Run validation
  if run_validation; then
    submit_for_review $ISSUE_NUM "true"
    return 0
  else
    submit_for_review $ISSUE_NUM "false"
    return 1
  fi
}
```

---

## Phase 3: Sprint Gate

### Check All Tasks Done

```bash
check_tasks_done() {
  local SPRINT_NUM=$1

  load_config
  get_sprint_info $SPRINT_NUM

  # Get count of non-Done issues (excluding gate)
  local OPEN_COUNT=$(gh issue list \
    --repo $ORG/$REPO \
    --milestone "$SPRINT_MILESTONE" \
    --state open \
    --json number,title \
    --jq "[.[] | select(.title | contains(\"$GATE_SUFFIX\") | not)] | length")

  if [ "$OPEN_COUNT" -eq 0 ]; then
    echo "All tasks complete!"
    return 0
  else
    echo "$OPEN_COUNT tasks still open"
    return 1
  fi
}
```

### Execute Gate

```bash
execute_gate() {
  local SPRINT_NUM=$1

  load_config
  get_sprint_info $SPRINT_NUM

  # Find gate issue
  local GATE_ISSUE=$(gh issue list \
    --repo $ORG/$REPO \
    --search "Sprint${SPRINT_NUM}${GATE_SUFFIX}" \
    --json number \
    --jq '.[0].number')

  if [ -z "$GATE_ISSUE" ]; then
    echo "Gate issue not found for Sprint $SPRINT_NUM"
    return 1
  fi

  echo "Executing gate #$GATE_ISSUE for Sprint $SPRINT_NUM..."

  # Start gate
  start_task $GATE_ISSUE

  # Run full validation
  complete_implementation $GATE_ISSUE

  if run_validation; then
    submit_for_review $GATE_ISSUE "true"
    echo "Sprint $SPRINT_NUM gate ready for human approval"
    return 0
  else
    submit_for_review $GATE_ISSUE "false"
    echo "Sprint $SPRINT_NUM gate validation failed"
    return 1
  fi
}
```

---

## Progress Reporting

### Sprint Status Report

```bash
sprint_report() {
  local SPRINT_NUM=$1

  load_config
  get_sprint_info $SPRINT_NUM

  echo "## Sprint $SPRINT_NUM: $SPRINT_NAME"
  echo ""
  echo "### Issues by Status"

  # Query project for sprint issues
  gh api graphql -f query="{
    organization(login: \"$ORG\") {
      projectV2(number: $PROJECT_NUM) {
        items(first: 100) {
          nodes {
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                }
              }
            }
            content {
              ... on Issue {
                milestone { title }
                number
                title
              }
            }
          }
        }
      }
    }
  }" --jq "[.data.organization.projectV2.items.nodes[] |
    select(.content.milestone.title == \"$SPRINT_MILESTONE\") |
    {issue: .content.number, title: .content.title, status: .fieldValues.nodes[].name}]"
}
```

---

## Error Recovery

### Retry Failed Task

```bash
retry_task() {
  local ISSUE_NUM=$1

  load_config

  # Move back to In Progress
  move_to_in_progress $ISSUE_NUM

  if [ "$(jq -r '.workflow.comment_on_transitions' $SPRINT_CONFIG)" = "true" ]; then
    gh issue comment $ISSUE_NUM --repo $ORG/$REPO \
      --body "🔄 **Retrying Task**

Previous attempt had issues. Trying again..."
  fi
}
```

### Skip Blocked Task

```bash
skip_task() {
  local ISSUE_NUM=$1
  local REASON=$2

  load_config

  gh issue comment $ISSUE_NUM --repo $ORG/$REPO \
    --body "⚠️ **Task Blocked**

Unable to complete this task automatically. Requires human intervention.

**Reason:** $REASON"
}
```

---

## Setting Up for a New Project

1. Create `.claude/config/project-board.json` (see github-project skill)
2. Create `.claude/config/sprints.json` with your sprint definitions
3. Create milestone-based issues in GitHub
4. Run `init_sprint 0` to start

---

## Interactive Workflow Functions

The following functions support the **14-step interactive workflow** (Step 0 + Steps 1-13) with user confirmation at each stage, including automatic sprint resumption detection. See `.claude/skills/universal/interactive-sprint/SKILL.md` for the full workflow documentation.

### Update Issue Checklist Item

Toggle a specific checklist item in an issue body.

```bash
update_checklist_item() {
  local ISSUE_NUM=$1
  local ITEM_TEXT=$2
  local CHECKED=$3  # "true" or "false"

  load_config

  # Get current issue body
  local BODY=$(gh issue view $ISSUE_NUM --repo $ORG/$REPO --json body --jq '.body')

  # Escape special regex characters in item text
  local ESCAPED_ITEM=$(printf '%s\n' "$ITEM_TEXT" | sed 's/[[\.*^$()+?{|]/\\&/g')

  if [ "$CHECKED" = "true" ]; then
    # Mark as checked: [ ] -> [x]
    BODY=$(echo "$BODY" | sed "s/- \[ \] $ESCAPED_ITEM/- [x] $ESCAPED_ITEM/")
  else
    # Mark as unchecked: [x] -> [ ]
    BODY=$(echo "$BODY" | sed "s/- \[x\] $ESCAPED_ITEM/- [ ] $ESCAPED_ITEM/")
  fi

  # Update the issue body
  gh issue edit $ISSUE_NUM --repo $ORG/$REPO --body "$BODY"

  # Add progress comment if configured
  if [ "$(jq -r '.workflow.comment_on_transitions' $SPRINT_CONFIG)" = "true" ] && [ "$CHECKED" = "true" ]; then
    gh issue comment $ISSUE_NUM --repo $ORG/$REPO \
      --body "✅ Completed: $ITEM_TEXT"
  fi
}
```

### Verify Issue Project Board Status

Query GitHub GraphQL API to verify an issue's current project board status.

```bash
verify_issue_status() {
  local ISSUE_NUM=$1
  local EXPECTED_STATUS=$2

  load_config

  local ACTUAL_STATUS=$(gh api graphql -f query="{
    repository(owner: \"$ORG\", name: \"$REPO\") {
      issue(number: $ISSUE_NUM) {
        projectItems(first: 10) {
          nodes {
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                }
              }
            }
            project { number }
          }
        }
      }
    }
  }" --jq ".data.repository.issue.projectItems.nodes[] | select(.project.number == $PROJECT_NUM) | .fieldValues.nodes[].name" 2>/dev/null | head -1)

  if [ "$ACTUAL_STATUS" = "$EXPECTED_STATUS" ]; then
    echo "verified"
    return 0
  else
    echo "Status mismatch: expected '$EXPECTED_STATUS', found '$ACTUAL_STATUS'"
    return 1
  fi
}
```

### Get Checklist Status

Count checked and unchecked items in an issue's checklist.

```bash
get_checklist_status() {
  local ISSUE_NUM=$1

  load_config

  local BODY=$(gh issue view $ISSUE_NUM --repo $ORG/$REPO --json body --jq '.body')

  local CHECKED=$(echo "$BODY" | grep -c '\[x\]' || echo 0)
  local UNCHECKED=$(echo "$BODY" | grep -c '\[ \]' || echo 0)
  local TOTAL=$((CHECKED + UNCHECKED))

  echo "$CHECKED/$TOTAL"
}
```

### Get Unchecked Items

Extract all unchecked checklist items from an issue.

```bash
get_unchecked_items() {
  local ISSUE_NUM=$1

  load_config

  local BODY=$(gh issue view $ISSUE_NUM --repo $ORG/$REPO --json body --jq '.body')

  # Return lines matching unchecked checkbox pattern
  echo "$BODY" | grep -E '^\s*- \[ \]' || true
}
```

### Generate Sprint Completion Report

Generate a detailed completion report with task summary and incomplete items.

```bash
generate_sprint_report() {
  local SPRINT_NUM=$1

  load_config
  get_sprint_info $SPRINT_NUM

  cat << EOF
# Sprint $SPRINT_NUM Completion Report

**Sprint:** $SPRINT_NAME
**Milestone:** $SPRINT_MILESTONE
**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Task Summary

| Issue | Title | State | Checklist |
|-------|-------|-------|-----------|
EOF

  # Get all issues in milestone
  gh issue list --repo $ORG/$REPO --milestone "$SPRINT_MILESTONE" --state all \
    --json number,title,state,body | jq -c '.[]' | while read -r issue; do
    local NUM=$(echo "$issue" | jq -r '.number')
    local TITLE=$(echo "$issue" | jq -r '.title')
    local STATE=$(echo "$issue" | jq -r '.state')
    local BODY=$(echo "$issue" | jq -r '.body')

    local CHECKED=$(echo "$BODY" | grep -c '\[x\]' || echo 0)
    local UNCHECKED=$(echo "$BODY" | grep -c '\[ \]' || echo 0)
    local TOTAL=$((CHECKED + UNCHECKED))

    if [ $UNCHECKED -gt 0 ]; then
      echo "| #$NUM | $TITLE | $STATE | **$CHECKED/$TOTAL** |"
    else
      echo "| #$NUM | $TITLE | $STATE | $CHECKED/$TOTAL |"
    fi
  done

  echo ""
}
```

### Generate Incomplete Items Report

Generate detailed report of incomplete items with links and suggested fixes.

```bash
generate_incomplete_report() {
  local SPRINT_NUM=$1

  load_config
  get_sprint_info $SPRINT_NUM

  echo "## Incomplete Items"
  echo ""

  local HAS_INCOMPLETE=false

  gh issue list --repo $ORG/$REPO --milestone "$SPRINT_MILESTONE" --state all \
    --json number,title,body | jq -c '.[]' | while read -r issue; do
    local NUM=$(echo "$issue" | jq -r '.number')
    local TITLE=$(echo "$issue" | jq -r '.title')
    local BODY=$(echo "$issue" | jq -r '.body')

    local UNCHECKED_ITEMS=$(echo "$BODY" | grep -E '^\s*- \[ \]' || true)

    if [ -n "$UNCHECKED_ITEMS" ]; then
      HAS_INCOMPLETE=true
      local UNCHECKED_COUNT=$(echo "$UNCHECKED_ITEMS" | wc -l | tr -d ' ')
      local TOTAL_COUNT=$(echo "$BODY" | grep -cE '^\s*- \[[ x]\]' || echo 0)

      cat << EOF
### #$NUM - $TITLE
**Link:** https://github.com/$ORG/$REPO/issues/$NUM
**Missing:** $UNCHECKED_COUNT of $TOTAL_COUNT checklist items

$UNCHECKED_ITEMS

**Suggested Fix:** Review the unchecked items above and complete the remaining work. Update the issue checklist in GitHub when each item is done.

EOF
    fi
  done

  if [ "$HAS_INCOMPLETE" = "false" ]; then
    echo "No incomplete items found. All checklist items have been completed."
    echo ""
  fi
}
```

### Check Sprint Completion

Verify if all sprint tasks are complete (all checklist items checked).

```bash
check_sprint_completion() {
  local SPRINT_NUM=$1

  load_config
  get_sprint_info $SPRINT_NUM

  local INCOMPLETE_COUNT=0

  gh issue list --repo $ORG/$REPO --milestone "$SPRINT_MILESTONE" --state all \
    --json number,body | jq -c '.[]' | while read -r issue; do
    local BODY=$(echo "$issue" | jq -r '.body')
    local UNCHECKED=$(echo "$BODY" | grep -c '\[ \]' || echo 0)

    if [ "$UNCHECKED" -gt 0 ]; then
      INCOMPLETE_COUNT=$((INCOMPLETE_COUNT + 1))
    fi
  done

  if [ "$INCOMPLETE_COUNT" -eq 0 ]; then
    echo "complete"
    return 0
  else
    echo "$INCOMPLETE_COUNT issues have incomplete items"
    return 1
  fi
}
```

---

## Related Files

- Project Config: `.claude/config/project-board.json`
- Sprint Config: `.claude/config/sprints.json`
- GitHub Project Skill: `.claude/skills/universal/github-project/SKILL.md`
- Interactive Sprint Skill: `.claude/skills/universal/interactive-sprint/SKILL.md`
- Phase Command: `.claude/commands/phase.md`
