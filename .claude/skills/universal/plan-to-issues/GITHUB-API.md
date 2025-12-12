# GitHub API Commands

> CLI commands and API calls for issue and milestone management

## Prerequisites

### Authentication Check

```bash
# Verify GitHub CLI is authenticated
gh auth status

# Expected output:
# github.com
#   ✓ Logged in to github.com account USERNAME
#   - Active account: true
#   - Git operations protocol: ssh
#   - Token scopes: 'read:org', 'repo'
```

### Required Scope

The `repo` scope is required for:
- Creating issues
- Creating milestones
- Editing issues
- Adding labels

---

## Repository Configuration

### Load from Config

```bash
# Read from project config file
PROJECT_CONFIG=".claude/config/project-board.json"

OWNER=$(jq -r '.organization' $PROJECT_CONFIG)
REPO=$(jq -r '.repository' $PROJECT_CONFIG)

echo "Using: $OWNER/$REPO"
```

### Set Default Repository

```bash
# Set default using values from config
gh repo set-default $OWNER/$REPO
```

---

## Milestone Operations

### Create Milestone

```bash
gh api repos/{owner}/{repo}/milestones \
  --method POST \
  -f title="Sprint 0: Foundation" \
  -f state="open" \
  -f description="Critical infrastructure setup"
```

### List Milestones

```bash
# Get all milestones
gh api repos/{owner}/{repo}/milestones \
  --jq '.[] | "\(.number): \(.title)"'

# Get milestone by title
gh api repos/{owner}/{repo}/milestones \
  --jq '.[] | select(.title == "Sprint 0: Foundation") | .number'
```

### Update Milestone

```bash
gh api repos/{owner}/{repo}/milestones/{milestone_number} \
  --method PATCH \
  -f state="closed"
```

---

## Issue Operations

### Create Issue

```bash
gh issue create \
  --repo {owner}/{repo} \
  --title "Sprint0.1 - Task Name" \
  --body "$(cat <<'EOF'
## Objective
Task description here

## Checklist
- [ ] Step 1
- [ ] Step 2

## Acceptance Criteria
- [ ] Criterion 1
EOF
)"
```

### Create Issue with Labels

```bash
gh issue create \
  --repo {owner}/{repo} \
  --title "Sprint0.1 - Task Name" \
  --label "Sprint: 0" \
  --body "Issue body..."
```

### Create Multiple Issues (Parallel)

```bash
# Create issues in parallel for efficiency
for task in "Task1" "Task2" "Task3"; do
  gh issue create \
    --repo {owner}/{repo} \
    --title "$task" \
    --body "Body for $task" &
done
wait
echo "All issues created"
```

### Get Issue Number After Creation

```bash
# Create and capture issue number
issue_url=$(gh issue create \
  --repo {owner}/{repo} \
  --title "Sprint0.1 - Task" \
  --body "Body")

# Extract issue number from URL
issue_number=$(echo "$issue_url" | grep -oE '[0-9]+$')
echo "Created issue #$issue_number"
```

---

## Issue Editing

### Assign to Milestone

```bash
gh issue edit {issue_number} \
  --repo {owner}/{repo} \
  --milestone "Sprint 0: Foundation"
```

### Add Labels

```bash
gh issue edit {issue_number} \
  --repo {owner}/{repo} \
  --add-label "Sprint: 0"
```

### Batch Assign to Milestone

```bash
# Assign issues 33-48 to Sprint 0 milestone
for i in {33..48}; do
  gh issue edit $i \
    --repo {owner}/{repo} \
    --milestone "Sprint 0: Foundation" &
done
wait
```

### Close Issue

```bash
gh issue close {issue_number} --repo {owner}/{repo}
```

### Reopen Issue

```bash
gh issue reopen {issue_number} --repo {owner}/{repo}
```

---

## Label Operations

### Create Label

```bash
gh label create "Sprint: 0" \
  --repo {owner}/{repo} \
  --color "0E8A16" \
  --description "Sprint 0 - Foundation"
```

### Create Label (Force/Update)

```bash
# Create or update if exists
gh label create "Sprint: 0" \
  --repo {owner}/{repo} \
  --color "0E8A16" \
  --force
```

### List Labels

```bash
gh label list --repo {owner}/{repo}
```

### Create All Sprint Labels

```bash
# Sprint labels with colors
labels=(
  "Sprint: 0|0E8A16|Foundation"
  "Sprint: 1|1D76DB|Atoms - Buttons & Badges"
  "Sprint: 2|0052CC|Atoms - Nav, Tabs, Forms"
  "Sprint: 3|5319E7|Molecules - Cards & Items"
  "Sprint: 4|7057FF|Molecules - Search & Filters"
  "Sprint: 5|008672|Organisms - Grids & Lists"
  "Sprint: 6|00B4D8|Organisms - Carousels"
  "Sprint: 7|0077B6|Organisms - Panels"
  "Sprint: 8|023E8A|Organisms - Charts"
  "Sprint: 9|03045E|Organisms - Modals"
  "Sprint: 10|6A0572|Organisms - Social & Map"
  "Sprint: 11|A4133C|Page Assembly - Dashboards"
  "Sprint: 12|C9184A|Page Assembly - Complex"
  "Sprint: 13|FF4D6D|Testing & Hardening"
  "Sprint: 14|D00000|Pre-Production"
)

for label in "${labels[@]}"; do
  IFS='|' read -r name color desc <<< "$label"
  gh label create "$name" \
    --repo {owner}/{repo} \
    --color "$color" \
    --description "$desc" \
    --force 2>/dev/null || true
done

# Type labels
gh label create "gate" --color "D93F0B" --description "Sprint gate verification" --force
gh label create "task" --color "5319E7" --description "Implementation task" --force
```

---

## Querying Issues

### List Issues by Milestone

```bash
gh issue list \
  --repo {owner}/{repo} \
  --milestone "Sprint 0: Foundation"
```

### List Issues by Label

```bash
gh issue list \
  --repo {owner}/{repo} \
  --label "Sprint: 0"
```

### Get Issue Details (JSON)

```bash
gh issue view {issue_number} \
  --repo {owner}/{repo} \
  --json number,title,state,milestone,labels
```

### Count Issues per Milestone

```bash
gh api repos/{owner}/{repo}/milestones \
  --jq '.[] | "\(.title): \(.open_issues) open, \(.closed_issues) closed"'
```

### Find Unassigned Issues

```bash
gh issue list \
  --repo {owner}/{repo} \
  --json number,milestone \
  --jq '.[] | select(.milestone == null) | .number'
```

---

## Bulk Operations

### Create All Milestones

```bash
#!/bin/bash
# Load from config
PROJECT_CONFIG=".claude/config/project-board.json"
SPRINT_CONFIG=".claude/config/sprints.json"

OWNER=$(jq -r '.organization' $PROJECT_CONFIG)
REPO=$(jq -r '.repository' $PROJECT_CONFIG)

# Read milestones from sprint config
jq -r '.sprints[].milestone' $SPRINT_CONFIG | while read milestone; do
  gh api repos/$OWNER/$REPO/milestones \
    --method POST \
    -f title="$milestone" \
    -f state="open" 2>/dev/null || echo "Milestone exists: $milestone"
done
```

### Assign All Issues to Milestones

```bash
#!/bin/bash
# Load from config
PROJECT_CONFIG=".claude/config/project-board.json"
SPRINT_CONFIG=".claude/config/sprints.json"

OWNER=$(jq -r '.organization' $PROJECT_CONFIG)
REPO=$(jq -r '.repository' $PROJECT_CONFIG)

# Read sprint milestone assignments from config
# Example: assign issues by sprint using milestone names from sprints.json
jq -c '.sprints[]' $SPRINT_CONFIG | while read sprint; do
  milestone=$(echo $sprint | jq -r '.milestone')
  # Issues would be assigned based on creation order or explicit mapping
  echo "Assigning issues to: $milestone"
done
```

---

## Error Handling

### Check for Existing Issue

```bash
# Search for existing issue by title
existing=$(gh issue list \
  --repo {owner}/{repo} \
  --search "Sprint0.1" \
  --json number \
  --jq '.[0].number')

if [ -n "$existing" ]; then
  echo "Issue already exists: #$existing"
else
  # Create issue
  gh issue create ...
fi
```

### Handle Rate Limiting

```bash
# Add delay between API calls
for i in {1..100}; do
  gh issue create ... &
  # Limit concurrent requests
  if (( i % 10 == 0 )); then
    wait
    sleep 1
  fi
done
wait
```

### Retry on Failure

```bash
create_issue() {
  local title="$1"
  local body="$2"
  local retries=3

  for ((i=1; i<=retries; i++)); do
    if gh issue create --title "$title" --body "$body"; then
      return 0
    fi
    echo "Retry $i/$retries..."
    sleep 2
  done

  echo "Failed to create issue: $title"
  return 1
}
```

---

## Verification Commands

### Verify Milestone Counts

```bash
gh api repos/{owner}/{repo}/milestones \
  --jq '.[] | "Milestone \(.number) (\(.title)): \(.open_issues) open issues"'
```

### Verify All Issues Assigned

```bash
# Should return empty if all assigned
gh issue list \
  --repo {owner}/{repo} \
  --json number,milestone \
  --jq '.[] | select(.milestone == null)'
```

### Summary Report

```bash
echo "=== Issue Summary ==="
echo "Total issues: $(gh issue list --repo {owner}/{repo} --state all --json number --jq 'length')"
echo "Open issues: $(gh issue list --repo {owner}/{repo} --state open --json number --jq 'length')"
echo ""
echo "=== Per Milestone ==="
gh api repos/{owner}/{repo}/milestones \
  --jq '.[] | "\(.title): \(.open_issues) open, \(.closed_issues) closed"'
```

---

## Quick Reference

| Operation | Command |
|-----------|---------|
| Create milestone | `gh api repos/O/R/milestones --method POST -f title="..."` |
| Create issue | `gh issue create --title "..." --body "..."` |
| Add label | `gh issue edit N --add-label "..."` |
| Assign milestone | `gh issue edit N --milestone "..."` |
| Close issue | `gh issue close N` |
| List by milestone | `gh issue list --milestone "..."` |
| List by label | `gh issue list --label "..."` |
| View issue JSON | `gh issue view N --json field1,field2` |
