---
description: Execute a sprint from the architecture optimization plan
argument-hint: [sprint-number]
allowed-tools:
  - Bash(gh auth:*)
  - Bash(gh issue:*)
  - Bash(gh api:*)
  - Bash(gh pr:*)
  - Bash(gh repo:*)
  - Bash(gh project:*)
  - Bash(jq :*)
  - Bash(jq:*)
  - Bash(npm run:*)
  - Bash(npm test:*)
  - Bash(npm install:*)
  - Bash(node :*)
  - Bash(node:*)
  - Bash(cat :*)
  - Bash(cat:*)
  - Bash(echo :*)
  - Bash(echo:*)
  - Bash(for :*)
  - Bash(if :*)
  - Bash(while :*)
  - Bash(cd :*)
  - Bash(mkdir :*)
  - Bash(mkdir:*)
  - Bash(ls :*)
  - Bash(ls:*)
  - Bash(ls -:*)
  - Bash(pwd:*)
  - Bash(sed :*)
  - Bash(sed:*)
  - Bash(grep :*)
  - Bash(grep:*)
  - Bash(head :*)
  - Bash(head:*)
  - Bash(tail :*)
  - Bash(tail:*)
  - Bash(#:*)
  - Bash(# :*)
  - Bash(# U:*)
  - Bash(# C:*)
  - Bash(# G:*)
  - Bash(# M:*)
  - Bash(ITEM_ID=:*)
  - Bash(BODY=:*)
  - Bash(UPDATED=:*)
  - Bash(STATUS=:*)
  - Bash(ORG=:*)
  - Bash(REPO=:*)
  - Bash(PROJECT_ID=:*)
  - Bash(PROJECT_CONFIG=:*)
  - Bash(SPRINT_CONFIG=:*)
  - Bash(SPRINT_NUM=:*)
  - Bash(MILESTONE=:*)
  - Bash(ISSUES=:*)
  - Bash(ISSUE=:*)
  - Bash(STATUS_FIELD=:*)
  - Bash(TODO_ID=:*)
  - Bash(IN_PROGRESS_ID=:*)
  - Bash(TESTING_ID=:*)
  - Bash(REVIEW_ID=:*)
  - Bash(DONE_ID=:*)
  - Bash(ACTUAL_STATUS=:*)
  - Bash(FIELDS=:*)
  - Bash(git status:*)
  - Bash(git add:*)
  - Bash(git commit:*)
  - Bash(git push:*)
  - Bash(git diff:*)
  - Bash(git log:*)
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

Execute **Sprint $1** from the Architecture Optimization Plan v4 using an **interactive, confirmation-based workflow**.

## IMPORTANT: Use GitHub CLI Only

**ALWAYS use the GitHub CLI (`gh`) for all GitHub operations.** Do NOT use MCP tools (like `mcp__github__*`). The GitHub CLI provides reliable, consistent behavior for issue management and project board operations.

## Pre-Requisite: Verify GitHub CLI Authentication

**BEFORE checking sprint status (Phase 0), execute this check:**

```bash
gh auth status
```

**If authentication fails, STOP and display these remediation steps:**

1. Run `gh auth login` to authenticate
2. For project board operations, also run: `gh auth refresh -s project`
3. Re-run `/phase $1` after authentication succeeds

**Only proceed to Phase 0 (Sprint Status Check) if authentication is successful.**

---

## Skill References

- Interactive Sprint: @.claude/skills/universal/interactive-sprint/SKILL.md
- Sprint Runner: @.claude/skills/universal/sprint-runner/SKILL.md
- GitHub Project: @.claude/skills/universal/github-project/SKILL.md
- Agent Mapping: @docs/site-refactor/AGENT-SPRINT-MAPPING_v4.md

## Reference

- Full Plan: @docs/site-refactor/ARCHITECTURE-OPTIMIZATION-PLAN_v4.md
- Project Flow: @docs/PROJECT-MANAGEMENT-FLOW_v1.md

---

## Interactive Workflow Overview

This command implements a **14-step user-controlled workflow** (Step 0 + Steps 1-13) where every phase requires explicit confirmation before proceeding. Step 0 automatically detects if a sprint was previously started and allows resumption from where it left off.

### User Signals

| Signal | Meaning |
|--------|---------|
| `yes`, `y` | Proceed with the action |
| `no`, `n` | Don't proceed, hold |
| `ready`, `next`, `done` | Review complete, continue |
| `hold`, `wait`, `pause` | Pause execution |
| `verify` | Re-check sprint completion |
| `skip` | Skip current task (with confirmation) |
| `retry` | Retry failed validation |
| `compact` | Trigger context compaction now |
| `skip compact` | Skip compaction, continue to next task |
| `resume` | Confirm resumption of in-progress sprint |
| `restart` | Restart sprint from beginning (reset all to Todo) |

---

## The 14-Step Workflow (Step 0 + Steps 1-13)

```
PRE-REQUISITE: VERIFY AUTHENTICATION
└─ Run `gh auth status` - HALT if not authenticated

PHASE 0: SPRINT STATUS CHECK (Step 0)
└─ 0. Claude checks sprint status, detects if resuming or fresh start

PHASE A: SPRINT KICKOFF (Steps 1-6) ← Skipped if resuming
├─ 1. User runs /phase N
├─ 2. Claude displays sprint overview
├─ 3. User confirms kickoff (yes) or resume
├─ 4. Claude moves all issues to "Todo" (skip if resuming)
├─ 5. Claude asks "Ready to start first/next task?"
└─ 6. User confirms task start (yes)

PHASE B: TASK EXECUTION LOOP (Steps 7-12a) ← Repeats for each task
├─ 7. Claude executes task (updates checklists)
├─ 8. Claude moves to "Testing | Validating"
├─ 9. User reviews in GitHub, moves to "Review"
├─ 10. User signals completion (ready)
├─ 11. Claude verifies status, asks "Start next?"
├─ 12. User confirms or holds (yes/no)
└─ 12a. Context compaction (every 3 tasks or on "compact")

PHASE C: SPRINT GATE (Step 13)
└─ 13. Claude generates completion report with links/fixes
```

---

## Sprint Overview

| Sprint | Name | Focus |
|--------|------|-------|
| 0 | Foundation | TypeScript, security, React 19, infrastructure |
| 1 | Atoms - Buttons & Badges | Button variants, badge components |
| 2 | Atoms - Nav, Tabs, Forms | Navigation, tabs, form inputs |
| 3 | Molecules - Cards & Items | Card components, list items |
| 4 | Molecules - Search & Filters | Search inputs, filter components |
| 5 | Organisms - Grids & Lists | Grid layouts, virtualized lists |
| 6 | Organisms - Carousels | Carousel components |
| 7 | Organisms - Panels | Dashboard panels, info panels |
| 8 | Organisms - Charts | Recharts wrappers |
| 9 | Organisms - Modals | Modal dialogs |
| 10 | Organisms - Social & Map | Social feeds, Mapbox integration |
| 11 | Page Assembly - Dashboards | WorldDashboard, SceneDashboard refactor |
| 12 | Page Assembly - Complex | Library, Team, Profile refactor |
| 13 | Testing & Hardening | Test coverage, E2E tests |
| 14 | Pre-Production | Final validation, deployment prep |

---

## PHASE 0: Sprint Status Check

### Step 0: Detect Sprint State

Before displaying the sprint overview, check the current state of all sprint issues:

```bash
# Load configuration
PROJECT_CONFIG=".claude/config/project-board.json"
SPRINT_CONFIG=".claude/config/sprints.json"

ORG=$(jq -r '.organization' $PROJECT_CONFIG)
REPO=$(jq -r '.repository' $PROJECT_CONFIG)
PROJECT_ID=$(jq -r '.project.id' $PROJECT_CONFIG)

SPRINT_NUM=$1
MILESTONE=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .milestone" $SPRINT_CONFIG)

# Get all issues with their status and checklist progress
gh issue list --repo $ORG/$REPO --milestone "$MILESTONE" --state all \
  --json number,title,state,body,labels \
  --jq '.[] | {number, title, state, checklist_total: ([.body | scan("- \\[[ x]\\]")] | length), checklist_done: ([.body | scan("- \\[x\\]")] | length)}'

# Query project board status for each issue
for ISSUE in $ISSUES; do
  gh api graphql -f query="{
    repository(owner: \"$ORG\", name: \"$REPO\") {
      issue(number: $ISSUE) {
        projectItems(first: 10) {
          nodes {
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue { name }
              }
            }
          }
        }
      }
    }
  }" --jq '.data.repository.issue.projectItems.nodes[0].fieldValues.nodes[].name'
done
```

### Step 0a: Categorize Issues

Group issues into categories:

| Category | Criteria |
|----------|----------|
| **Done** | Status = "Done" or "Review" with 100% checklist |
| **In Progress** | Status = "In Progress" or "Testing" |
| **Incomplete** | Has unchecked checklist items |
| **Not Started** | Status = "Todo" or no status |

### Step 0b: Display Resume Prompt (if applicable)

**If sprint has been previously started (any issues not in "Todo" or with progress):**

```markdown
## Sprint $1 - Resuming Previous Session

**Sprint:** [Sprint Name]
**Milestone:** [Milestone name]

### Sprint Progress Detected

| Status | Count | Issues |
|--------|-------|--------|
| ✅ Done | [X] | #33, #34, #35 |
| 🔄 In Progress | [X] | #36 |
| ⏳ Not Started | [X] | #37, #38, #39 |

### Current Task: Sprint$1.X - [Task Title] (#[number])

**Status:** In Progress
**Checklist Progress:** [completed]/[total] items

#### Remaining Work:
- [ ] Unchecked item 1
- [ ] Unchecked item 2
- [ ] Unchecked item 3

**Link:** https://github.com/$ORG/$REPO/issues/[number]

---

**Options:**
- Type "resume" to continue from this task
- Type "restart" to reset all issues to "Todo" and start fresh
- Type "verify" to re-check the sprint status

**Please verify this matches your GitHub project board before proceeding.**
```

**Wait for user signal: `resume`, `restart`, or `verify`**

### Step 0c: Handle User Response

**On "resume":**
- Skip Phase A (Steps 1-4)
- Jump directly to Step 5-6 with the in-progress task
- If task is partially complete, display remaining checklist items

**On "restart":**
- Proceed to Phase A (Steps 1-6)
- Move all issues back to "Todo" status
- Reset as if starting fresh

**On "verify":**
- Re-run Step 0 to check current status
- Display updated progress

**If sprint is fresh (all issues in "Todo" or no status):**
- Proceed directly to Phase A (Steps 1-6)

---

## PHASE A: Sprint Kickoff

### Step 1-2: Display Sprint Overview

Display the sprint information and ask for confirmation:

```markdown
## Sprint $1 Kickoff

**Sprint:** [Sprint Name from config]
**Milestone:** [Milestone name]
**Tasks:** [X] issues + 1 gate
**Description:** [Sprint description]

### Tasks in this Sprint:
1. Sprint$1.1 - [Task title]
2. Sprint$1.2 - [Task title]
...
N. Sprint$1.G - Sprint Gate

This will:
1. Move all sprint issues to "Todo" status
2. Prepare the task queue for sequential execution
3. Execute tasks one-by-one with your confirmation

**Ready to kick off Sprint $1? (yes/no)**
```

**Wait for user confirmation.**

### Step 3-4: Stage Sprint (on "yes")

```bash
# Load configuration
PROJECT_CONFIG=".claude/config/project-board.json"
SPRINT_CONFIG=".claude/config/sprints.json"

ORG=$(jq -r '.organization' $PROJECT_CONFIG)
REPO=$(jq -r '.repository' $PROJECT_CONFIG)
PROJECT_ID=$(jq -r '.project.id' $PROJECT_CONFIG)
STATUS_FIELD=$(jq -r '.fields.status.id' $PROJECT_CONFIG)
TODO_ID=$(jq -r '.columns.todo.id' $PROJECT_CONFIG)

SPRINT_NUM=$1
MILESTONE=$(jq -r ".sprints[] | select(.number == $SPRINT_NUM) | .milestone" $SPRINT_CONFIG)

# Get all issues in milestone
ISSUES=$(gh issue list --repo $ORG/$REPO --milestone "$MILESTONE" --json number,title --jq '.[].number')

# Move each issue to Todo column
for ISSUE in $ISSUES; do
  # Get project item ID
  ITEM_ID=$(gh api graphql -f query="{
    repository(owner: \"$ORG\", name: \"$REPO\") {
      issue(number: $ISSUE) {
        projectItems(first: 10) {
          nodes { id project { number } }
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
  }"
done
```

### Step 5-6: Confirm First Task

```markdown
## Sprint Staged Successfully

All [X] issues have been moved to "Todo" status.

### First Task: Sprint$1.1 - [Task Title]

**Issue:** #[number]
**Checklist:** [X] items
**Agent:** [designated agent name]
**Link:** https://github.com/$ORG/$REPO/issues/[number]

**Ready to start this task? (yes/no)**
```

**Wait for user confirmation.**

---

## PHASE B: Task Execution Loop

For each task, follow these steps:

### Step 7: Execute Task (after user confirms "yes")

1. **Move to "In Progress"**
   ```bash
   IN_PROGRESS_ID=$(jq -r '.columns.in_progress.id' $PROJECT_CONFIG)
   # Move issue to In Progress column
   ```

2. **Add start comment**
   ```bash
   gh issue comment $ISSUE --repo $ORG/$REPO \
     --body "🚀 **Task Started**

   Working on this task now."
   ```

3. **Display checklist from issue**
   ```bash
   gh issue view $ISSUE --repo $ORG/$REPO --json body --jq '.body'
   ```

4. **Execute checklist items with REAL-TIME updates**

   **CRITICAL: Update GitHub after EACH item, not in batch.**

   For EACH checklist item in the task:

   **a.** Do the work for that specific checklist item

   **b.** IMMEDIATELY update GitHub to check it off (before starting the next item):
   ```bash
   # Get current body
   BODY=$(gh issue view $ISSUE --repo $ORG/$REPO --json body --jq '.body')
   # Check off the specific item (use exact text from checklist)
   UPDATED=$(echo "$BODY" | sed 's/- \[ \] Exact checklist item text/- [x] Exact checklist item text/')
   # Update the issue
   gh issue edit $ISSUE --repo $ORG/$REPO --body "$UPDATED"
   ```

   **c.** Then proceed to the next checklist item

   **Why real-time updates matter:**
   - Sprint resumption (Step 0) uses checklist progress to detect partial completion
   - If interrupted mid-task, GitHub reflects exactly what was completed
   - Users can monitor progress in real-time on the project board

   **DO NOT batch updates.** Each checkbox must be updated individually, immediately after completing that item's work.

5. **Verify acceptance criteria**

### Step 8: Move to Testing

**IMPORTANT: Claude ONLY moves tasks to "Testing | Validating". Claude should NEVER move tasks to "Review" or "Done" - those transitions are controlled by the user.**

```bash
TESTING_ID=$(jq -r '.columns.testing.id' $PROJECT_CONFIG)
# Move issue to Testing | Validating column

# Run validation
npm run build
npm run lint
```

### Step 8 (continued): Notify User

```markdown
## Task Ready for Review

**Task:** Sprint$1.X - [Task Title]
**Issue:** #[number]
**Status:** Testing | Validating
**Validation:** All checks passed / [X] failed

**Checklist Progress:** [completed]/[total] items complete

Please:
1. Review the implementation in GitHub
2. Make any corrections or modifications needed
3. Move issue #[number] to "Review" status in the project board
4. Type "ready" when complete

**Link:** https://github.com/$ORG/$REPO/issues/[number]
```

**Wait for user to type "ready"**

### Step 9-10: User Reviews and Signals Completion

User reviews in GitHub, makes corrections, moves issue to "Review" status, then types "ready".

### Step 11: Verify Status

```bash
# Query GitHub to verify status is "Review"
ACTUAL_STATUS=$(gh api graphql -f query="{
  repository(owner: \"$ORG\", name: \"$REPO\") {
    issue(number: $ISSUE) {
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
}" --jq '.data.repository.issue.projectItems.nodes[0].fieldValues.nodes[].name')

if [ "$ACTUAL_STATUS" != "Review" ]; then
  echo "Status mismatch: please move issue to 'Review' first"
fi
```

### Step 12: Confirm Next Task

```markdown
## Task Complete

**Completed:** Sprint$1.X - [Task Title] (#[number])

### Next Task: Sprint$1.Y - [Next Task Title]

**Issue:** #[next_number]
**Checklist:** [X] items
**Link:** https://github.com/$ORG/$REPO/issues/[next_number]

**Ready to start the next task? (yes/no)**

- Type "yes" to continue to the next task
- Type "no" to hold (you can say "ready" later to resume)
```

**If "yes":** Proceed to Step 12a
**If "no":** Hold until user explicitly says "ready" or "yes"

### Step 12a: Context Compaction (after every 3 tasks or on user request)

To maintain optimal performance during long sprints, compact the conversation context periodically:

**Automatic trigger:** After completing every 3rd task
**Manual trigger:** User types "compact" at any confirmation prompt

```markdown
## Context Compaction

**Tasks completed this session:** [X]
**Compaction threshold reached.**

Compacting conversation context to optimize performance...

**What happens:**
1. Current session state is preserved in summary
2. Conversation is compacted using /compact
3. Sprint continues from the next task

**Session State to Preserve:**
- Sprint: $1 ([Sprint Name])
- Completed tasks: [list]
- Next task: Sprint$1.Y (#[number])
- GitHub links and issue numbers

Type "compact" to proceed with compaction, or "skip compact" to continue without compaction.
```

**On "compact":**
1. Run `/compact` to summarize and compress the conversation
2. After compaction, display a brief status and continue to Step 7 for next task

**On "skip compact":**
Return directly to Step 7 for next task

---

## PHASE C: Sprint Gate (Step 13)

When all tasks are complete and the Sprint Gate issue is reached:

### Step 13a: Verify All Tasks Complete

```bash
# Check all sprint issues for completion
gh issue list --repo $ORG/$REPO --milestone "$MILESTONE" --state all \
  --json number,title,state,body
```

### Step 13b: Generate Completion Report

```markdown
# Sprint $1 Completion Report

**Sprint:** [Sprint Name]
**Milestone:** [Milestone]
**Generated:** [timestamp]

## Task Summary

| Issue | Title | Status | Checklist |
|-------|-------|--------|-----------|
| #33 | Task 1 | Done | 5/5 |
| #34 | Task 2 | Done | 3/3 |
| #35 | Task 3 | Review | **4/5** |
...

## Incomplete Items

### #35 - [Task Title]
**Link:** https://github.com/$ORG/$REPO/issues/35
**Missing:** 1 of 5 checklist items

- [ ] Unchecked item text

**Suggested Fix:** [Specific action to complete this item]

---

## Validation Status

- `npm run build` - PASS/FAIL
- `npm run lint` - PASS/FAIL
- `npx tsc --noEmit` - PASS/FAIL

## Sprint Completion Status
```

### Step 13c: Conditional Completion

**If ALL items complete:**
```markdown
## Sprint $1 Complete

All tasks have been verified complete. The Sprint Gate is ready for final approval.

**Action Required:**
1. Move the Sprint Gate issue (#[gate_number]) to "Done" in GitHub
2. Start a new conversation to begin Sprint [N+1]

**Next Sprint:** Sprint [N+1] - [Name]

To start the next sprint, run:
```
/phase [N+1]
```
```

**If incomplete items exist:**
```markdown
## Sprint $1 Has Incomplete Items

**[X] issues have incomplete checklist items.**

Please address the incomplete items listed above:
1. Review each linked issue
2. Complete the missing checklist items
3. Type "verify" to re-check completion

Once all items are complete, move the Sprint Gate to "Done".
```

---

## Session State Tracking

At the end of each response, include a session state summary:

```markdown
---
**Session State:**
- Sprint: $1 ([Sprint Name])
- Phase: [Status Check / Kickoff / Task Execution / Gate]
- Mode: [Fresh Start / Resumed]
- Current Task: Sprint$1.X (#[number]) - [status]
- Completed: [list of completed task IDs]
- Remaining: [list of remaining task IDs]
---
```

---

## Error Handling

### Status Mismatch
If user says "ready" but status isn't "Review":
```markdown
## Status Verification Failed

The issue status doesn't match expected state.

**Expected:** Review
**Actual:** [actual status]

Please move issue #[number] to "Review" in the GitHub project board:
https://github.com/$ORG/$REPO/issues/[number]

Type "ready" again once updated.
```

### Validation Failure
If build/lint fails:
```markdown
## Validation Failed

- `npm run build` - FAILED
- `npm run lint` - PASSED

**Error Output:**
[error details]

The task remains in "Testing | Validating".

Options:
- Fix the issues and type "retry" to re-run validation
- Type "skip" to skip this task (not recommended)
```

---

## Sprint-Specific Agents

Reference @docs/site-refactor/AGENT-SPRINT-MAPPING_v4.md for the full agent mapping.

### Quick Reference

| Sprint | Primary Agents |
|--------|----------------|
| 0 | typescript-setup, security-hardening, build-system-fix |
| 1-2 | atom-buttons, atom-badges, atom-navigation, atom-tabs, atom-forms |
| 3-4 | molecule-cards, molecule-items, molecule-search |
| 5-10 | organism-grids, organism-carousels, organism-panels, organism-charts, organism-modals, organism-social |
| 11-12 | page-refactor-dashboard, page-refactor-complex |
| 13-14 | test-framework-setup, e2e-test-builder, pre-production-gate |

---

## Configuration Files

### Project Board Config
Location: `.claude/config/project-board.json`

### Sprint Config
Location: `.claude/config/sprints.json`

Workflow settings:
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

## Important Notes

1. **User Control**: Every phase requires explicit user confirmation
2. **Checklist Updates**: Claude updates GitHub issue checklists as work progresses
3. **Status Verification**: Claude verifies GitHub status matches expected state
4. **Incomplete Item Reporting**: Completion reports include links and suggested fixes
5. **Session Boundaries**: Start a new conversation for each sprint
6. **Human Gate - Status Transitions**:
   - **Claude moves:** Todo → In Progress → Testing | Validating
   - **User moves:** Testing | Validating → Review → Done
   - Claude should NEVER move tasks to "Review" or "Done" - those are user-controlled
7. **Context Compaction**: After every 3 tasks, Claude prompts to compact the conversation context to maintain performance. Type "compact" to proceed or "skip compact" to continue without compaction. You can also type "compact" at any confirmation prompt to trigger compaction manually.

   **Customizing Compaction Frequency:** You can adjust how often compaction triggers by editing `.claude/config/sprints.json`:
   ```json
   "compaction": {
     "auto_trigger_after_tasks": 3  // Change to 1 for complex sprints, or higher for simple tasks
   }
   ```
   | Sprint Type | Recommended Value |
   |-------------|-------------------|
   | Complex (Sprint 0, 11-12) | `1` or `2` |
   | Standard (most sprints) | `3` (default) |
   | Simple (atoms, badges) | `3` or higher |
8. **Sprint Resumption**: Step 0 automatically detects if a sprint was previously started. Type "resume" to continue from where you left off, or "restart" to begin fresh. Always verify the detected state matches your GitHub project board before proceeding.
