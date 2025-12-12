# Interactive Sprint Workflow Skill

> Universal skill for user-controlled, confirmation-based sprint execution

## CRITICAL: GitHub CLI Only

**ALWAYS use the GitHub CLI (`gh`) for ALL GitHub operations in this workflow.**

Do NOT use:
- MCP tools (`mcp__github__*`)
- Direct API calls without `gh`
- Any other GitHub integration tools

```bash
# Always verify authentication first
gh auth status
```

---

## Overview

This skill implements a **14-step interactive workflow** (Step 0 + Steps 1-13) where every phase requires explicit user confirmation before proceeding. Step 0 automatically detects if a sprint was previously started and allows resumption from where it left off. It works within Claude Code's synchronous conversation model using explicit user signals rather than event-based triggers.

## The 14-Step Workflow (Step 0 + Steps 1-13)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    PHASE 0: SPRINT STATUS CHECK                      │
├──────────────────────────────────────────────────────────────────────┤
│ 0. Claude checks sprint status in GitHub                             │
│ 0a. If progress detected → Display resume prompt                     │
│ 0b. User confirms: resume / restart / verify                         │
│     ↳ resume: Skip to step 5-6 with in-progress task                 │
│     ↳ restart: Proceed to Phase A, reset all to "Todo"               │
│     ↳ verify: Re-check status                                        │
└──────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    PHASE A: SPRINT KICKOFF (skip if resuming)        │
├──────────────────────────────────────────────────────────────────────┤
│ 1. User runs `/phase N`                                              │
│ 2. Claude displays sprint overview, asks "Ready to kick off?"        │
│ 3. User confirms (yes)                                               │
│ 4. Claude moves all issues to "Todo" (skip if resuming)              │
│ 5. Claude asks "Ready to start first/next task?"                     │
└──────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    PHASE B: TASK EXECUTION LOOP                      │
├──────────────────────────────────────────────────────────────────────┤
│ 6. User confirms task start (yes)                                    │
│ 7. Claude executes task (updates checklist, verifies criteria)       │
│ 8. Claude moves to "Testing | Validating", notifies user             │
│ 9. User reviews in GitHub, moves to "Review"                         │
│ 10. User signals completion (ready)                                  │
│ 11. Claude verifies status, asks "Start next task?"                  │
│ 12. User confirms or holds (yes/no)                                  │
│ 12a. Context compaction (every 3 tasks or on "compact")              │
│     ↳ If yes: Loop back to step 6                                    │
│     ↳ If no: Hold until user says "ready"                            │
└──────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼ (all tasks complete)
┌──────────────────────────────────────────────────────────────────────┐
│                    PHASE C: SPRINT GATE                              │
├──────────────────────────────────────────────────────────────────────┤
│ 13. Claude generates completion report with:                         │
│     - Task summary table                                             │
│     - Incomplete items with GitHub links                             │
│     - Suggested fixes for each incomplete item                       │
│     - Validation status                                              │
│     - Next steps / new conversation prompt                           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## User Signal Patterns

Since Claude Code operates synchronously without webhooks or polling, users signal readiness through conversation:

### Continue Signals
| Signal | Meaning |
|--------|---------|
| `yes` | Proceed with the action |
| `y` | Short form of yes |
| `continue` | Continue to next step |
| `ready` | Review complete, proceed |
| `next` | Move to next task |
| `done` | Current task is complete |

### Hold Signals
| Signal | Meaning |
|--------|---------|
| `no` | Don't proceed |
| `n` | Short form of no |
| `stop` | Stop execution |
| `hold` | Pause and wait |
| `wait` | Not ready yet |
| `pause` | Pause workflow |

### Special Signals
| Signal | Meaning |
|--------|---------|
| `verify` | Re-check sprint completion |
| `status` | Show current session state |
| `skip` | Skip current task (with confirmation) |
| `retry` | Retry failed validation |
| `compact` | Trigger context compaction now |
| `skip compact` | Skip compaction, continue to next task |
| `resume` | Confirm resumption of in-progress sprint |
| `restart` | Restart sprint from beginning (reset all to Todo) |

---

## Configuration

Settings are stored in `.claude/config/sprints.json`:

```json
{
  "workflow": {
    "confirmation_mode": "interactive",
    "confirmation_prompts": {
      "sprint_start": true,
      "task_start": true,
      "task_completion": true,
      "sprint_completion": true
    },
    "user_ready_signals": ["ready", "next", "continue", "done", "yes", "y"],
    "user_hold_signals": ["hold", "wait", "stop", "no", "n", "pause"],
    "compaction": {
      "auto_trigger_after_tasks": 3,
      "manual_trigger": "compact",
      "skip_signal": "skip compact"
    }
  }
}
```

---

## Phase 0: Sprint Status Detection Functions

These functions support Step 0 for detecting sprint state and enabling resumption.

### Detect Sprint State

Query all sprint issues and their current status to determine if resuming or fresh start.

```bash
detect_sprint_state() {
  local SPRINT_NUM=$1

  local CONFIG=".claude/config/project-board.json"
  local SPRINT_CONFIG=".claude/config/sprints.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)
  local PROJECT_NUM=$(jq -r '.project.number' $CONFIG)

  local MILESTONE=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .milestone" $SPRINT_CONFIG)

  # Get all issues with checklist progress
  local ISSUES_DATA=$(gh issue list --repo $ORG/$REPO --milestone "$MILESTONE" --state all \
    --json number,title,state,body \
    --jq '.[] | {
      number,
      title,
      state,
      checklist_total: ([.body | scan("- \\[[ x]\\]")] | length),
      checklist_done: ([.body | scan("- \\[x\\]")] | length)
    }')

  echo "$ISSUES_DATA"
}
```

### Get Issue Project Board Status

Query the project board status for a specific issue.

```bash
get_issue_board_status() {
  local ISSUE_NUM=$1

  local CONFIG=".claude/config/project-board.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)
  local PROJECT_NUM=$(jq -r '.project.number' $CONFIG)

  gh api graphql -f query="{
    repository(owner: \"$ORG\", name: \"$REPO\") {
      issue(number: $ISSUE_NUM) {
        projectItems(first: 10) {
          nodes {
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue { name }
              }
            }
            project { number }
          }
        }
      }
    }
  }" --jq ".data.repository.issue.projectItems.nodes[] | select(.project.number == $PROJECT_NUM) | .fieldValues.nodes[].name" 2>/dev/null | head -1
}
```

### Categorize Sprint Issues

Categorize issues into Done, In Progress, Incomplete, and Not Started.

```bash
categorize_sprint_issues() {
  local SPRINT_NUM=$1

  local CONFIG=".claude/config/project-board.json"
  local SPRINT_CONFIG=".claude/config/sprints.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)
  local PROJECT_NUM=$(jq -r '.project.number' $CONFIG)

  local MILESTONE=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .milestone" $SPRINT_CONFIG)

  local DONE_ISSUES=""
  local IN_PROGRESS_ISSUES=""
  local NOT_STARTED_ISSUES=""

  # Get all issues in milestone
  gh issue list --repo $ORG/$REPO --milestone "$MILESTONE" --state all \
    --json number,title,body | jq -c '.[]' | while read -r issue; do

    local NUM=$(echo "$issue" | jq -r '.number')
    local TITLE=$(echo "$issue" | jq -r '.title')
    local BODY=$(echo "$issue" | jq -r '.body')

    local CHECKED=$(echo "$BODY" | grep -c '\[x\]' || echo 0)
    local UNCHECKED=$(echo "$BODY" | grep -c '\[ \]' || echo 0)
    local TOTAL=$((CHECKED + UNCHECKED))

    # Get board status
    local STATUS=$(get_issue_board_status $NUM)

    case "$STATUS" in
      "Done")
        echo "DONE|#$NUM|$TITLE|$CHECKED/$TOTAL"
        ;;
      "Review")
        if [ "$UNCHECKED" -eq 0 ]; then
          echo "DONE|#$NUM|$TITLE|$CHECKED/$TOTAL"
        else
          echo "IN_PROGRESS|#$NUM|$TITLE|$CHECKED/$TOTAL"
        fi
        ;;
      "In Progress"|"Testing | Validating")
        echo "IN_PROGRESS|#$NUM|$TITLE|$CHECKED/$TOTAL"
        ;;
      "Todo"|"")
        echo "NOT_STARTED|#$NUM|$TITLE|$CHECKED/$TOTAL"
        ;;
      *)
        echo "NOT_STARTED|#$NUM|$TITLE|$CHECKED/$TOTAL"
        ;;
    esac
  done
}
```

### Get Current In-Progress Task

Find the first in-progress task to resume from.

```bash
get_current_task() {
  local SPRINT_NUM=$1

  local CONFIG=".claude/config/project-board.json"
  local SPRINT_CONFIG=".claude/config/sprints.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)
  local PROJECT_NUM=$(jq -r '.project.number' $CONFIG)

  local MILESTONE=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .milestone" $SPRINT_CONFIG)

  # Find first issue with status "In Progress" or "Testing | Validating"
  gh issue list --repo $ORG/$REPO --milestone "$MILESTONE" --state open \
    --json number,title,body | jq -c '.[]' | while read -r issue; do

    local NUM=$(echo "$issue" | jq -r '.number')
    local STATUS=$(get_issue_board_status $NUM)

    if [ "$STATUS" = "In Progress" ] || [ "$STATUS" = "Testing | Validating" ]; then
      echo "$NUM"
      return
    fi
  done
}
```

### Check If Sprint Has Progress

Determine if sprint needs resume prompt or is fresh start.

```bash
sprint_has_progress() {
  local SPRINT_NUM=$1

  local CONFIG=".claude/config/project-board.json"
  local SPRINT_CONFIG=".claude/config/sprints.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)

  local MILESTONE=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .milestone" $SPRINT_CONFIG)

  # Check for any issues not in "Todo" status or with checked items
  gh issue list --repo $ORG/$REPO --milestone "$MILESTONE" --state all \
    --json number,body | jq -c '.[]' | while read -r issue; do

    local NUM=$(echo "$issue" | jq -r '.number')
    local BODY=$(echo "$issue" | jq -r '.body')

    local CHECKED=$(echo "$BODY" | grep -c '\[x\]' || echo 0)
    local STATUS=$(get_issue_board_status $NUM)

    # If any issue has checked items or is not in Todo, sprint has progress
    if [ "$CHECKED" -gt 0 ] || [ "$STATUS" != "Todo" ] && [ -n "$STATUS" ]; then
      echo "true"
      return
    fi
  done

  echo "false"
}
```

### Display Resume Prompt

Generate the resume prompt for Step 0b.

```bash
display_resume_prompt() {
  local SPRINT_NUM=$1
  local SPRINT_NAME=$2

  local CONFIG=".claude/config/project-board.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)

  local CURRENT_TASK=$(get_current_task $SPRINT_NUM)

  cat << EOF
## Sprint $SPRINT_NUM - Resuming Previous Session

**Sprint:** $SPRINT_NAME
**Milestone:** Sprint $SPRINT_NUM: $SPRINT_NAME

### Sprint Progress Detected

$(categorize_sprint_issues $SPRINT_NUM | awk -F'|' '
  BEGIN { done=0; in_prog=0; not_started=0; done_list=""; in_prog_list=""; not_started_list="" }
  /^DONE/ { done++; done_list=done_list $2 ", " }
  /^IN_PROGRESS/ { in_prog++; in_prog_list=in_prog_list $2 ", " }
  /^NOT_STARTED/ { not_started++; not_started_list=not_started_list $2 ", " }
  END {
    print "| Status | Count | Issues |"
    print "|--------|-------|--------|"
    if (done > 0) print "| ✅ Done | " done " | " substr(done_list, 1, length(done_list)-2) " |"
    if (in_prog > 0) print "| 🔄 In Progress | " in_prog " | " substr(in_prog_list, 1, length(in_prog_list)-2) " |"
    if (not_started > 0) print "| ⏳ Not Started | " not_started " | " substr(not_started_list, 1, length(not_started_list)-2) " |"
  }
')

### Current Task: #$CURRENT_TASK

$(gh issue view $CURRENT_TASK --repo $ORG/$REPO --json title,body --jq '"**Title:** " + .title')
$(gh issue view $CURRENT_TASK --repo $ORG/$REPO --json body --jq '"**Checklist Progress:** " + (([.body | scan("\\[x\\]")] | length | tostring) + "/" + ([.body | scan("- \\[[ x]\\]")] | length | tostring))')

#### Remaining Work:
$(gh issue view $CURRENT_TASK --repo $ORG/$REPO --json body --jq '.body' | grep -E '^\s*- \[ \]' || echo "No unchecked items")

**Link:** https://github.com/$ORG/$REPO/issues/$CURRENT_TASK

---

**Options:**
- Type "resume" to continue from this task
- Type "restart" to reset all issues to "Todo" and start fresh
- Type "verify" to re-check the sprint status

**Please verify this matches your GitHub project board before proceeding.**
EOF
}
```

### Reset Sprint to Todo

Move all sprint issues back to Todo status for restart.

```bash
reset_sprint_to_todo() {
  local SPRINT_NUM=$1

  local CONFIG=".claude/config/project-board.json"
  local SPRINT_CONFIG=".claude/config/sprints.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)
  local PROJECT_ID=$(jq -r '.project.id' $CONFIG)
  local STATUS_FIELD=$(jq -r '.fields.status.id' $CONFIG)
  local TODO_ID=$(jq -r '.columns.todo.id' $CONFIG)

  local MILESTONE=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .milestone" $SPRINT_CONFIG)

  # Get all issues in milestone
  ISSUES=$(gh issue list --repo $ORG/$REPO --milestone "$MILESTONE" --state all \
    --json number --jq '.[].number')

  for ISSUE in $ISSUES; do
    # Get project item ID
    ITEM_ID=$(gh api graphql -f query="{
      repository(owner: \"$ORG\", name: \"$REPO\") {
        issue(number: $ISSUE) {
          projectItems(first: 10) {
            nodes { id }
          }
        }
      }
    }" --jq '.data.repository.issue.projectItems.nodes[0].id')

    # Move to Todo
    gh api graphql -f query="mutation {
      updateProjectV2ItemFieldValue(input: {
        projectId: \"$PROJECT_ID\"
        itemId: \"$ITEM_ID\"
        fieldId: \"$STATUS_FIELD\"
        value: { singleSelectOptionId: \"$TODO_ID\" }
      }) { projectV2Item { id } }
    }" 2>/dev/null

    echo "Reset #$ISSUE to Todo"
  done
}
```

---

## Helper Functions

### 1. Display Sprint Kickoff Prompt

```bash
display_sprint_kickoff() {
  local SPRINT_NUM=$1
  local SPRINT_NAME=$2
  local TASK_COUNT=$3
  local GATE_ISSUE=$4

  cat << EOF
## Sprint $SPRINT_NUM Kickoff

**Sprint:** $SPRINT_NAME
**Tasks:** $TASK_COUNT issues
**Gate:** $GATE_ISSUE

This will:
1. Move all $TASK_COUNT sprint issues to "Todo" status
2. Prepare the task queue for sequential execution

**Ready to kick off Sprint $SPRINT_NUM? (yes/no)**
EOF
}
```

### 2. Display Task Start Prompt

```bash
display_task_prompt() {
  local ISSUE_NUM=$1
  local TASK_ID=$2
  local TASK_TITLE=$3
  local CHECKLIST_COUNT=$4

  cat << EOF
## Next Task: $TASK_ID - $TASK_TITLE

**Issue:** #$ISSUE_NUM
**Checklist:** $CHECKLIST_COUNT items
**Link:** https://github.com/ORG/REPO/issues/$ISSUE_NUM

**Ready to start this task? (yes/no)**
EOF
}
```

### 3. Display Task Review Notification

```bash
display_review_notification() {
  local ISSUE_NUM=$1
  local TASK_ID=$2
  local TASK_TITLE=$3
  local VALIDATION_RESULT=$4

  cat << EOF
## Task Ready for Review

**Task:** $TASK_ID - $TASK_TITLE
**Issue:** #$ISSUE_NUM
**Status:** Testing | Validating
**Validation:** $VALIDATION_RESULT

Please:
1. Review the implementation in GitHub
2. Move issue #$ISSUE_NUM to "Review" status
3. Type "ready" when complete

**Link:** https://github.com/ORG/REPO/issues/$ISSUE_NUM
EOF
}
```

### 4. Display Next Task Confirmation

```bash
display_next_task_prompt() {
  local COMPLETED_TASK=$1
  local NEXT_TASK=$2

  cat << EOF
## Task Complete

**Completed:** $COMPLETED_TASK

**Next Task:** $NEXT_TASK

**Ready to start the next task? (yes/no)**

- Type "yes" to continue
- Type "no" to hold (you can say "ready" later to resume)
EOF
}
```

---

## Checklist Update Functions

### CRITICAL: Real-Time Updates Required

**Checklist items MUST be updated immediately after completing each item, NOT in batch after task completion.**

#### Why This Matters

1. **Sprint Resumption (Step 0)** - Uses checklist progress to detect partial completion. Batch updates mean interrupted tasks show 0% progress even if work was done.
2. **Real-Time Visibility** - Users watching the project board can see progress during task execution.
3. **Accuracy** - The GitHub issue should always reflect the actual state of work.

#### Correct Pattern

```
1. Start task
2. Complete checklist item 1 → UPDATE GITHUB IMMEDIATELY
3. Complete checklist item 2 → UPDATE GITHUB IMMEDIATELY
4. Complete checklist item 3 → UPDATE GITHUB IMMEDIATELY
5. All items done → Move to Testing
```

#### Wrong Pattern (DO NOT DO THIS)

```
1. Start task
2. Complete checklist item 1
3. Complete checklist item 2
4. Complete checklist item 3
5. Update ALL checkboxes at once ← WRONG: batch update
6. Move to Testing
```

#### Implementation

For EACH checklist item in a task:

1. **Do the work** for that specific checklist item
2. **Immediately call `update_checklist_item()`** to check it off
3. **Then proceed** to the next checklist item

```bash
# Example: Executing a task with 3 checklist items
ISSUE=35
ORG="Mythologi-XR"
REPO="elysium-web-app"

# Item 1: Do the work
# ... perform the actual work for item 1 ...
# IMMEDIATELY update GitHub
update_checklist_item $ISSUE "Create directory structure" "true"

# Item 2: Do the work
# ... perform the actual work for item 2 ...
# IMMEDIATELY update GitHub
update_checklist_item $ISSUE "Add configuration files" "true"

# Item 3: Do the work
# ... perform the actual work for item 3 ...
# IMMEDIATELY update GitHub
update_checklist_item $ISSUE "Update package.json" "true"

# NOW move to Testing status
```

---

### Update Single Checklist Item

```bash
update_checklist_item() {
  local ISSUE_NUM=$1
  local ITEM_TEXT=$2
  local CHECKED=$3  # "true" or "false"

  local CONFIG=".claude/config/project-board.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)

  # Get current issue body
  local BODY=$(gh issue view $ISSUE_NUM --repo $ORG/$REPO --json body --jq '.body')

  # Escape special characters in item text for sed
  local ESCAPED_ITEM=$(echo "$ITEM_TEXT" | sed 's/[[\.*^$()+?{|]/\\&/g')

  if [ "$CHECKED" = "true" ]; then
    # Mark as checked: [ ] -> [x]
    BODY=$(echo "$BODY" | sed "s/- \[ \] $ESCAPED_ITEM/- [x] $ESCAPED_ITEM/")
  else
    # Mark as unchecked: [x] -> [ ]
    BODY=$(echo "$BODY" | sed "s/- \[x\] $ESCAPED_ITEM/- [ ] $ESCAPED_ITEM/")
  fi

  # Update the issue
  gh issue edit $ISSUE_NUM --repo $ORG/$REPO --body "$BODY"

  # Add progress comment
  if [ "$CHECKED" = "true" ]; then
    gh issue comment $ISSUE_NUM --repo $ORG/$REPO \
      --body "Completed: $ITEM_TEXT"
  fi
}
```

### Get Checklist Status

```bash
get_checklist_status() {
  local ISSUE_NUM=$1

  local CONFIG=".claude/config/project-board.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)

  local BODY=$(gh issue view $ISSUE_NUM --repo $ORG/$REPO --json body --jq '.body')

  local CHECKED=$(echo "$BODY" | grep -c '\[x\]' || echo 0)
  local UNCHECKED=$(echo "$BODY" | grep -c '\[ \]' || echo 0)
  local TOTAL=$((CHECKED + UNCHECKED))

  echo "$CHECKED/$TOTAL"
}
```

### Get Unchecked Items

```bash
get_unchecked_items() {
  local ISSUE_NUM=$1

  local CONFIG=".claude/config/project-board.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)

  local BODY=$(gh issue view $ISSUE_NUM --repo $ORG/$REPO --json body --jq '.body')

  echo "$BODY" | grep -E '^\s*- \[ \]' || true
}
```

---

## Status Verification Functions

### Verify Issue Project Status

```bash
verify_issue_status() {
  local ISSUE_NUM=$1
  local EXPECTED_STATUS=$2

  local CONFIG=".claude/config/project-board.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)
  local PROJECT_NUM=$(jq -r '.project.number' $CONFIG)

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
    echo "Status: $ACTUAL_STATUS (expected: $EXPECTED_STATUS)"
    return 1
  fi
}
```

### Check All Sprint Tasks Status

```bash
check_sprint_status() {
  local SPRINT_NUM=$1

  local CONFIG=".claude/config/project-board.json"
  local SPRINT_CONFIG=".claude/config/sprints.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)

  local MILESTONE=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .milestone" $SPRINT_CONFIG)

  # Get all issues in milestone with their status
  gh issue list --repo $ORG/$REPO --milestone "$MILESTONE" --state all \
    --json number,title,state,body \
    --jq '.[] | "\(.number)|\(.title)|\(.state)"'
}
```

---

## Sprint Completion Report

### Generate Report

```bash
generate_sprint_report() {
  local SPRINT_NUM=$1

  local CONFIG=".claude/config/project-board.json"
  local SPRINT_CONFIG=".claude/config/sprints.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)

  local SPRINT_NAME=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .name" $SPRINT_CONFIG)
  local MILESTONE=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .milestone" $SPRINT_CONFIG)

  cat << EOF
# Sprint $SPRINT_NUM Completion Report

**Sprint:** $SPRINT_NAME
**Milestone:** $MILESTONE
**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Task Summary

| Issue | Title | Status | Checklist |
|-------|-------|--------|-----------|
EOF

  # Get all issues and their checklist status
  gh issue list --repo $ORG/$REPO --milestone "$MILESTONE" --state all \
    --json number,title,state,body | jq -r '.[] |
    "| #\(.number) | \(.title) | \(.state) | \(
      ((.body | scan("\\[x\\]") | length) // 0) as $checked |
      ((.body | scan("\\[ \\]") | length) // 0) as $unchecked |
      "\($checked)/\($checked + $unchecked)"
    ) |"'
}
```

### Generate Incomplete Items Section

```bash
generate_incomplete_section() {
  local SPRINT_NUM=$1

  local CONFIG=".claude/config/project-board.json"
  local SPRINT_CONFIG=".claude/config/sprints.json"
  local ORG=$(jq -r '.organization' $CONFIG)
  local REPO=$(jq -r '.repository' $CONFIG)

  local MILESTONE=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .milestone" $SPRINT_CONFIG)

  echo "## Incomplete Items"
  echo ""

  local HAS_INCOMPLETE=false

  # Check each issue for unchecked items
  gh issue list --repo $ORG/$REPO --milestone "$MILESTONE" --state all \
    --json number,title,body | jq -c '.[]' | while read -r issue; do

    local NUM=$(echo "$issue" | jq -r '.number')
    local TITLE=$(echo "$issue" | jq -r '.title')
    local BODY=$(echo "$issue" | jq -r '.body')

    local UNCHECKED=$(echo "$BODY" | grep -E '^\s*- \[ \]' || true)

    if [ -n "$UNCHECKED" ]; then
      HAS_INCOMPLETE=true
      cat << EOF
### #$NUM - $TITLE
**Link:** https://github.com/$ORG/$REPO/issues/$NUM
**Missing Items:**

$UNCHECKED

**Suggested Fix:** Review the unchecked items above and complete them before marking the sprint as done.

EOF
    fi
  done

  if [ "$HAS_INCOMPLETE" = false ]; then
    echo "No incomplete items found. All tasks are complete."
  fi
}
```

---

## Session State Tracking

Since Claude Code is stateless between messages, track session state in conversation output:

```markdown
---
**Session State:**
- Sprint: 0 (Foundation)
- Phase: Task Execution
- Mode: [Fresh Start / Resumed]
- Current Task: Sprint0.3 (#35) - waiting for review
- Completed: Sprint0.1 (#33), Sprint0.2 (#34)
- Remaining: Sprint0.4-Sprint0.16, Sprint0.G
---
```

### State Object Structure

```json
{
  "sprint_session": {
    "sprint_number": 0,
    "sprint_name": "Foundation",
    "phase": "task_execution",
    "mode": "fresh_start",
    "current_task": {
      "issue_number": 35,
      "task_id": "Sprint0.3",
      "title": "Build System Consolidation",
      "status": "waiting_for_review"
    },
    "completed_tasks": [
      {"issue": 33, "task_id": "Sprint0.1"},
      {"issue": 34, "task_id": "Sprint0.2"}
    ],
    "pending_tasks": [
      {"issue": 36, "task_id": "Sprint0.4"},
      {"issue": 37, "task_id": "Sprint0.5"}
    ],
    "gate_issue": 48
  }
}
```

---

## Error Handling

### Status Mismatch

When user says "ready" but status isn't "Review":

```markdown
## Status Verification Failed

The issue status doesn't match the expected state.

**Expected:** Review
**Actual:** Testing | Validating

Please move issue #35 to "Review" in the GitHub project board:
https://github.com/Mythologi-XR/elysium-web-app/issues/35

Type "ready" again once you've updated the status.
```

### Validation Failure

When build/lint fails:

```markdown
## Validation Failed

One or more validation checks failed:

- `npm run build` - FAILED
- `npm run lint` - PASSED

**Error Output:**
[error details]

The task remains in "Testing | Validating" status.

Options:
- Fix the issues and type "retry" to re-run validation
- Type "skip" to skip this task (not recommended)
```

### Session Interruption

When user leaves mid-task:

```markdown
## Session Interrupted

Your session was interrupted during task Sprint0.3.

**Current State:**
- Issue #35 is in "In Progress" status
- Checklist: 3/5 items complete

To resume:
1. Run `/phase 0` again
2. Claude will detect the partial state
3. You can continue from where you left off
```

---

## Related Files

- Configuration: `.claude/config/sprints.json`
- Project Board: `.claude/config/project-board.json`
- Phase Command: `.claude/commands/phase.md`
- Sprint Runner: `.claude/skills/universal/sprint-runner/SKILL.md`
- GitHub Project: `.claude/skills/universal/github-project/SKILL.md`
