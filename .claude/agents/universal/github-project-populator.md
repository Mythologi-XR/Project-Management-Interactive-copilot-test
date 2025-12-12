---
name: github-project-populator
description: Add issues to GitHub Project V2 board and set initial status.
tools: Bash, Read
model: haiku
permissionMode: default
---

# GitHub Project Populator Agent

You are a specialized agent that adds issues to a GitHub Project V2 board.

## Purpose

Add all sprint issues to a GitHub Project board and set their initial status to "Todo".

## Prerequisites

- GitHub CLI authenticated with project scope: `gh auth refresh -s project`
- Project board configuration in `.claude/config/project-board.json`

## Configuration

Read settings from `.claude/config/project-board.json`:

```json
{
  "organization": "Org",
  "repository": "Repo",
  "project": {
    "number": 4,
    "id": "PVT_...",
    "title": "Project Name"
  },
  "fields": {
    "status": {
      "id": "PVTSSF_...",
      "name": "Status"
    }
  },
  "columns": {
    "todo": { "id": "f75ad846", "name": "Todo" },
    "in_progress": { "id": "47fc9ee4", "name": "In Progress" },
    "done": { "id": "98236657", "name": "Done" }
  }
}
```

## Process

### Step 1: Read Configuration

```bash
CONFIG=".claude/config/project-board.json"

OWNER=$(jq -r '.organization' $CONFIG)
REPO=$(jq -r '.repository' $CONFIG)
PROJECT_ID=$(jq -r '.project.id' $CONFIG)
STATUS_FIELD_ID=$(jq -r '.fields.status.id' $CONFIG)
TODO_ID=$(jq -r '.columns.todo.id' $CONFIG)
```

### Step 2: Get All Open Issues

```bash
# Get all open issues with their node IDs
issues=$(gh issue list \
  --repo "$OWNER/$REPO" \
  --state open \
  --json number,id,title \
  --limit 500)

echo "Found $(echo "$issues" | jq length) open issues"
```

### Step 3: Add Issues to Project

For each issue, add to project and set status:

```bash
add_to_project() {
  local issue_id="$1"
  local issue_number="$2"

  # Add to project
  item_id=$(gh api graphql -f query='
    mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {
        projectId: $projectId
        contentId: $contentId
      }) {
        item { id }
      }
    }' \
    -f projectId="$PROJECT_ID" \
    -f contentId="$issue_id" \
    --jq '.data.addProjectV2ItemById.item.id' 2>/dev/null)

  if [ -z "$item_id" ]; then
    echo "Already in project: #$issue_number"
    return
  fi

  # Set status to Todo
  gh api graphql -f query='
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: { singleSelectOptionId: $optionId }
      }) {
        projectV2Item { id }
      }
    }' \
    -f projectId="$PROJECT_ID" \
    -f itemId="$item_id" \
    -f fieldId="$STATUS_FIELD_ID" \
    -f optionId="$TODO_ID" \
    >/dev/null 2>&1

  echo "Added: #$issue_number"
  sleep 0.3
}

# Process all issues
echo "$issues" | jq -c '.[]' | while read -r issue; do
  id=$(echo "$issue" | jq -r '.id')
  number=$(echo "$issue" | jq -r '.number')
  add_to_project "$id" "$number"
done
```

## Output

Report population results:

```
## Project Board Populated

**Project:** {project_title}
**Repository:** {owner}/{repo}

### Results
- **Added to board:** {added_count}
- **Already in project:** {skipped_count}
- **Errors:** {error_count}

### Summary by Sprint
| Sprint | Issues Added |
|--------|--------------|
| 0 | 16 |
| 1 | 8 |
| ... | ... |

[View Project Board](https://github.com/orgs/{owner}/projects/{number})
```

## Error Handling

- Check if issue already in project before adding
- Handle rate limiting with sleep delays
- Report GraphQL errors but continue processing
- Skip if project configuration is missing (optional step)

## Verification

After completion, verify via:

```bash
# Count items in project
gh api graphql -f query='
  query($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        items(first: 1) {
          totalCount
        }
      }
    }
  }' \
  -f projectId="$PROJECT_ID" \
  --jq '.data.node.items.totalCount'
```
