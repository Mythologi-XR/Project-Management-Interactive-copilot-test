# GitHub Project Board Skill

> Universal skill for managing GitHub Projects V2 Kanban boards

## Overview

This skill provides reusable commands for managing issues through a Kanban-style GitHub Project board. It is **project-agnostic** and reads configuration from a project-specific config file.

## Configuration

This skill requires a project configuration file at:
```
.claude/config/project-board.json
```

### Config File Structure

```json
{
  "organization": "Org-Name",
  "repository": "repo-name",
  "project": {
    "number": 4,
    "id": "PVT_xxxxxxxxxxxx",
    "title": "Project Name"
  },
  "fields": {
    "status": {
      "id": "PVTSSF_xxxxxxxxxxxx",
      "name": "Status"
    }
  },
  "columns": {
    "todo": {
      "id": "xxxxxxxx",
      "name": "Todo"
    },
    "in_progress": {
      "id": "xxxxxxxx",
      "name": "In Progress"
    },
    "testing": {
      "id": "xxxxxxxx",
      "name": "Testing | Validating"
    },
    "review": {
      "id": "xxxxxxxx",
      "name": "Review"
    },
    "done": {
      "id": "xxxxxxxx",
      "name": "Done"
    }
  }
}
```

### Discovering Project Configuration

To get the IDs for a new project, run:

```bash
# Get project ID and field IDs
gh api graphql -f query='
{
  organization(login: "YOUR_ORG") {
    projectV2(number: YOUR_PROJECT_NUMBER) {
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

---

## Required Token Scope

```bash
# Check current scopes
gh auth status

# Add project scope if missing
gh auth refresh -s project
```

---

## Core Operations

All operations read from the config file. Use `$CONFIG` as shorthand for the parsed config.

### Load Configuration

```bash
CONFIG_FILE=".claude/config/project-board.json"

# Read config values
ORG=$(jq -r '.organization' $CONFIG_FILE)
REPO=$(jq -r '.repository' $CONFIG_FILE)
PROJECT_ID=$(jq -r '.project.id' $CONFIG_FILE)
PROJECT_NUM=$(jq -r '.project.number' $CONFIG_FILE)
STATUS_FIELD=$(jq -r '.fields.status.id' $CONFIG_FILE)

# Column IDs
TODO_ID=$(jq -r '.columns.todo.id' $CONFIG_FILE)
IN_PROGRESS_ID=$(jq -r '.columns.in_progress.id' $CONFIG_FILE)
TESTING_ID=$(jq -r '.columns.testing.id' $CONFIG_FILE)
REVIEW_ID=$(jq -r '.columns.review.id' $CONFIG_FILE)
DONE_ID=$(jq -r '.columns.done.id' $CONFIG_FILE)
```

### Add Issue to Project

```bash
add_to_project() {
  local ISSUE_NUM=$1

  # Get issue node ID
  local NODE_ID=$(gh api repos/$ORG/$REPO/issues/$ISSUE_NUM --jq '.node_id')

  # Add to project
  gh api graphql -f query="
  mutation {
    addProjectV2ItemById(input: {
      projectId: \"$PROJECT_ID\"
      contentId: \"$NODE_ID\"
    }) {
      item { id }
    }
  }" --jq '.data.addProjectV2ItemById.item.id'
}
```

### Get Project Item ID

```bash
get_item_id() {
  local ISSUE_NUM=$1

  gh api graphql -f query="{
    repository(owner: \"$ORG\", name: \"$REPO\") {
      issue(number: $ISSUE_NUM) {
        projectItems(first: 10) {
          nodes { id project { number } }
        }
      }
    }
  }" --jq ".data.repository.issue.projectItems.nodes[] | select(.project.number == $PROJECT_NUM) | .id"
}
```

### Move Issue to Column

```bash
move_to_column() {
  local ISSUE_NUM=$1
  local COLUMN_ID=$2

  # Get or create project item
  local ITEM_ID=$(get_item_id $ISSUE_NUM)

  if [ -z "$ITEM_ID" ]; then
    ITEM_ID=$(add_to_project $ISSUE_NUM)
  fi

  # Update column
  gh api graphql -f query="
  mutation {
    updateProjectV2ItemFieldValue(input: {
      projectId: \"$PROJECT_ID\"
      itemId: \"$ITEM_ID\"
      fieldId: \"$STATUS_FIELD\"
      value: { singleSelectOptionId: \"$COLUMN_ID\" }
    }) { projectV2Item { id } }
  }"
}
```

---

## Convenience Functions

### Move to Specific Columns

```bash
move_to_todo() {
  move_to_column $1 $TODO_ID
}

move_to_in_progress() {
  move_to_column $1 $IN_PROGRESS_ID
}

move_to_testing() {
  move_to_column $1 $TESTING_ID
}

move_to_review() {
  move_to_column $1 $REVIEW_ID
}

# Note: move_to_done should typically be done by humans
move_to_done() {
  move_to_column $1 $DONE_ID
}
```

### Batch Operations

```bash
# Move multiple issues to a column
batch_move_to_column() {
  local COLUMN_ID=$1
  shift
  local ISSUES=("$@")

  for issue in "${ISSUES[@]}"; do
    move_to_column $issue $COLUMN_ID &
  done
  wait
}

# Initialize sprint - move all milestone issues to Todo
init_sprint() {
  local MILESTONE_PATTERN=$1

  ISSUES=$(gh issue list \
    --repo $ORG/$REPO \
    --milestone "$MILESTONE_PATTERN*" \
    --json number \
    --jq '.[].number')

  for issue in $ISSUES; do
    echo "Moving #$issue to Todo..."
    move_to_todo $issue
  done
}
```

---

## Query Operations

### Get Items in Column

```bash
get_items_in_column() {
  local COLUMN_NAME=$1

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
                number
                title
              }
            }
          }
        }
      }
    }
  }" --jq ".data.organization.projectV2.items.nodes[] | select(.fieldValues.nodes[].name == \"$COLUMN_NAME\") | .content | \"#\(.number): \(.title)\""
}
```

### Count by Column

```bash
count_by_column() {
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
          }
        }
      }
    }
  }" --jq '[.data.organization.projectV2.items.nodes[].fieldValues.nodes[].name] | group_by(.) | map({column: .[0], count: length}) | .[]'
}
```

---

## Workflow Integration

### Standard Task Lifecycle

```bash
# 1. Start task
start_task() {
  local ISSUE=$1
  move_to_in_progress $ISSUE
  gh issue comment $ISSUE --repo $ORG/$REPO \
    --body "🚀 **Task Started**"
}

# 2. Implementation complete
complete_implementation() {
  local ISSUE=$1
  move_to_testing $ISSUE
}

# 3. Submit for review (after validation passes)
submit_for_review() {
  local ISSUE=$1
  local MESSAGE=$2

  move_to_review $ISSUE
  gh issue comment $ISSUE --repo $ORG/$REPO \
    --body "$MESSAGE"
}
```

---

## Error Handling

### Issue Not in Project

The `move_to_column` function automatically adds issues to the project if they're not already present.

### Rate Limiting

For large batch operations:

```bash
batch_with_delay() {
  local COLUMN_ID=$1
  shift
  local ISSUES=("$@")

  for issue in "${ISSUES[@]}"; do
    move_to_column $issue $COLUMN_ID
    sleep 0.5  # Rate limit protection
  done
}
```

---

## Setting Up a New Project

1. Create a GitHub Project V2 with your desired columns
2. Run the discovery query to get IDs
3. Create `.claude/config/project-board.json` with the IDs
4. Test with: `move_to_todo <issue_number>`

---

## Related Files

- Config: `.claude/config/project-board.json`
- Sprint Runner: `.claude/skills/universal/sprint-runner/SKILL.md`
- Phase Command: `.claude/commands/phase.md`
