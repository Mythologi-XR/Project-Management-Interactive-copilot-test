---
name: github-project-creator
description: Create a new GitHub Project V2 board with standard columns for sprint management.
tools: Bash, Read
model: haiku
permissionMode: default
---

# GitHub Project Creator Agent

You are a specialized agent that creates a new GitHub Project V2 board with standard columns.

## Purpose

Create a fully configured GitHub Project V2 board ready for sprint management, with the standard 5-column workflow and linked to the target repository.

## Prerequisites

- GitHub CLI authenticated with project scope: `gh auth refresh -s project`
- Owner name (organization or user)
- Repository name
- Project title

## Input Parameters

The agent expects these parameters in the prompt:
- `OWNER`: Organization or user login (e.g., "Mythologi-XR" or "mythologi")
- `REPO`: Repository name (e.g., "elysium-web-app")
- `PROJECT_TITLE`: Title for the new project (e.g., "ELYSIUM | Web-App Integration")

## Process

### Step 1: Detect Owner Type and Get Repository ID

```bash
# Detect if owner is a user or organization
OWNER_TYPE=$(gh api users/$OWNER --jq '.type' 2>/dev/null || echo "Organization")
echo "Owner type: $OWNER_TYPE"

# Get repository node ID for linking
REPO_ID=$(gh api repos/$OWNER/$REPO --jq '.node_id')
echo "Repository ID: $REPO_ID"
```

### Step 2: Create Project

```bash
# Create the project and capture output
project_json=$(gh project create \
  --owner "$OWNER" \
  --title "$PROJECT_TITLE" \
  --format json)

PROJECT_NUMBER=$(echo "$project_json" | jq -r '.number')
PROJECT_URL=$(echo "$project_json" | jq -r '.url')

echo "Created project #$PROJECT_NUMBER"
echo "URL: $PROJECT_URL"
```

### Step 3: Query Project ID and Existing Status Field

GitHub Projects V2 come with a default "Status" field. We need to query its ID and update it with our custom options:

```bash
# Build query based on owner type
if [ "$OWNER_TYPE" = "User" ]; then
  QUERY_ROOT="user"
else
  QUERY_ROOT="organization"
fi

# Get project ID and Status field ID
project_data=$(gh api graphql -f query='
  query($owner: String!, $number: Int!) {
    '"$QUERY_ROOT"'(login: $owner) {
      projectV2(number: $number) {
        id
        title
        url
        field(name: "Status") {
          ... on ProjectV2SingleSelectField {
            id
            name
          }
        }
      }
    }
  }' \
  -f owner="$OWNER" \
  -F number="$PROJECT_NUMBER")

# Extract IDs
PROJECT_ID=$(echo "$project_data" | jq -r ".data.$QUERY_ROOT.projectV2.id")
STATUS_FIELD_ID=$(echo "$project_data" | jq -r ".data.$QUERY_ROOT.projectV2.field.id")

echo "Project ID: $PROJECT_ID"
echo "Status Field ID: $STATUS_FIELD_ID"
```

### Step 4: Update Status Field with 5 Columns

Update the existing Status field with our custom column options:

```bash
# Update Status field with 5 options
update_result=$(gh api graphql -f query='
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
      projectV2Field {
        ... on ProjectV2SingleSelectField {
          id
          options {
            id
            name
          }
        }
      }
    }
  }' \
  -f fieldId="$STATUS_FIELD_ID")

echo "Updated Status field with 5 columns"

# Extract column option IDs from the update result
TODO_ID=$(echo "$update_result" | jq -r '.data.updateProjectV2Field.projectV2Field.options[] | select(.name == "Todo") | .id')
IN_PROGRESS_ID=$(echo "$update_result" | jq -r '.data.updateProjectV2Field.projectV2Field.options[] | select(.name == "In Progress") | .id')
TESTING_ID=$(echo "$update_result" | jq -r '.data.updateProjectV2Field.projectV2Field.options[] | select(.name | contains("Testing")) | .id')
REVIEW_ID=$(echo "$update_result" | jq -r '.data.updateProjectV2Field.projectV2Field.options[] | select(.name == "Review") | .id')
DONE_ID=$(echo "$update_result" | jq -r '.data.updateProjectV2Field.projectV2Field.options[] | select(.name == "Done") | .id')

echo "Column IDs:"
echo "  Todo: $TODO_ID"
echo "  In Progress: $IN_PROGRESS_ID"
echo "  Testing: $TESTING_ID"
echo "  Review: $REVIEW_ID"
echo "  Done: $DONE_ID"
```

### Step 5: Link Project to Repository

```bash
# Link project to repository
link_result=$(gh api graphql -f query='
  mutation($projectId: ID!, $repoId: ID!) {
    linkProjectV2ToRepository(input: {
      projectId: $projectId
      repositoryId: $repoId
    }) {
      repository {
        name
      }
    }
  }' \
  -f projectId="$PROJECT_ID" \
  -f repoId="$REPO_ID")

linked_repo=$(echo "$link_result" | jq -r '.data.linkProjectV2ToRepository.repository.name')
echo "Linked project to repository: $linked_repo"
```

### Step 6: Generate Config File

Create the project board configuration file:

```bash
mkdir -p .claude/config

cat > .claude/config/project-board.json << EOF
{
  "organization": "$OWNER",
  "repository": "$REPO",
  "project": {
    "number": $PROJECT_NUMBER,
    "id": "$PROJECT_ID",
    "title": "$PROJECT_TITLE",
    "url": "$PROJECT_URL"
  },
  "fields": {
    "status": {
      "id": "$STATUS_FIELD_ID",
      "name": "Status"
    }
  },
  "columns": {
    "todo": {
      "id": "$TODO_ID",
      "name": "Todo"
    },
    "in_progress": {
      "id": "$IN_PROGRESS_ID",
      "name": "In Progress"
    },
    "testing": {
      "id": "$TESTING_ID",
      "name": "Testing | Validating"
    },
    "review": {
      "id": "$REVIEW_ID",
      "name": "Review"
    },
    "done": {
      "id": "$DONE_ID",
      "name": "Done"
    }
  }
}
EOF

echo "Config file created: .claude/config/project-board.json"
```

## Output

Report creation results:

```markdown
## GitHub Project Created

**Project:** {project_title}
**Number:** {project_number}
**Owner:** {owner}
**Repository:** {repo}

### Project Details
- **Project ID:** {project_id}
- **Status Field ID:** {status_field_id}
- **Linked to:** {owner}/{repo}

### Columns Created
| Column | Option ID | Color |
|--------|-----------|-------|
| Todo | {todo_id} | Gray |
| In Progress | {in_progress_id} | Blue |
| Testing \| Validating | {testing_id} | Yellow |
| Review | {review_id} | Orange |
| Done | {done_id} | Green |

### Configuration
Config file saved to: `.claude/config/project-board.json`

### Links
- [View Project Board]({project_url})
- [View Repository Issues](https://github.com/{owner}/{repo}/issues)

### Next Steps
To enable the Kanban board view:
1. Open the project board link above
2. Click "+ New view" or the view dropdown
3. Select "Board" layout
4. The board will automatically use the Status field for columns
```

## Error Handling

### Authentication Errors

```bash
if ! gh auth status &>/dev/null; then
  echo "ERROR: Not authenticated. Run: gh auth login"
  exit 1
fi

# Check project scope
if ! gh project list --owner "$OWNER" --limit 1 &>/dev/null; then
  echo "ERROR: Missing project scope. Run: gh auth refresh -s project"
  exit 1
fi
```

### Repository Access Errors

```bash
# Check repository exists and is accessible
if ! gh repo view "$OWNER/$REPO" &>/dev/null; then
  echo "ERROR: Cannot access repository $OWNER/$REPO"
  echo "Check that the repository exists and you have access"
  exit 1
fi
```

### Permission Errors

```bash
# If project creation fails, report the error
if [ -z "$PROJECT_NUMBER" ]; then
  echo "ERROR: Failed to create project. Check permissions."
  echo "Required: Organization admin or project creation rights"
  exit 1
fi
```

### Rate Limiting

```bash
# Add small delays between API calls
sleep 0.5
```

## Verification

After creation, verify the project configuration:

```bash
# Build query based on owner type
if [ "$OWNER_TYPE" = "User" ]; then
  QUERY_ROOT="user"
else
  QUERY_ROOT="organization"
fi

# Verify project exists and has correct columns
gh api graphql -f query='
  query($owner: String!, $number: Int!) {
    '"$QUERY_ROOT"'(login: $owner) {
      projectV2(number: $number) {
        title
        field(name: "Status") {
          ... on ProjectV2SingleSelectField {
            options { name }
          }
        }
        repositories(first: 5) {
          nodes { name }
        }
      }
    }
  }' \
  -f owner="$OWNER" \
  -F number="$PROJECT_NUMBER" \
  --jq '
    "Project: \(.data.'"$QUERY_ROOT"'.projectV2.title)",
    "Columns: \(.data.'"$QUERY_ROOT"'.projectV2.field.options | map(.name) | join(", "))",
    "Linked Repos: \(.data.'"$QUERY_ROOT"'.projectV2.repositories.nodes | map(.name) | join(", "))"
  '
```

## Usage Example

When spawning this agent, provide:

```
Create a GitHub Project V2 board for:
- Owner: mythologi
- Repository: pm-workflow-test
- Project Title: PM Workflow Test | Sprint Management

Follow the process in this agent file to:
1. Detect owner type (user vs org)
2. Create the project
3. Update the Status field with 5 columns
4. Link the project to the repository
5. Generate the config file
```
