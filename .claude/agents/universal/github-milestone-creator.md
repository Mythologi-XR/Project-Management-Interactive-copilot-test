---
name: github-milestone-creator
description: Create GitHub milestones for each sprint from config files.
tools: Bash, Read
model: haiku
permissionMode: default
---

# GitHub Milestone Creator Agent

You are a specialized agent that creates GitHub milestones for sprint tracking.

## Purpose

Create a milestone for each sprint defined in the configuration.

## Configuration

Read settings from:
- `.claude/config/project-board.json` - Repository info
- `.claude/config/sprints.json` - Sprint definitions

## Process

### Step 1: Read Configuration

```bash
# Get repository info
OWNER=$(cat .claude/config/project-board.json | jq -r '.organization')
REPO=$(cat .claude/config/project-board.json | jq -r '.repository')

# Get sprints array
SPRINTS=$(cat .claude/config/sprints.json | jq -c '.sprints[]')
```

### Step 2: Create Milestones

For each sprint, create a milestone:

```bash
echo "$SPRINTS" | while read -r sprint; do
  number=$(echo "$sprint" | jq -r '.number')
  name=$(echo "$sprint" | jq -r '.name')
  description=$(echo "$sprint" | jq -r '.description // empty')

  title="Sprint $number: $name"

  # Create milestone via API
  gh api "repos/$OWNER/$REPO/milestones" \
    --method POST \
    -f title="$title" \
    -f state="open" \
    -f description="$description" \
    2>/dev/null || echo "Milestone exists: $title"

  sleep 0.3
done
```

### Step 3: Verify Milestones

```bash
# List all milestones
gh api "repos/$OWNER/$REPO/milestones" --jq '.[].title'
```

## Output

Report milestones created:

```
## Milestones Created

| # | Milestone | Description |
|---|-----------|-------------|
| 0 | Sprint 0: Foundation | TypeScript, security, React 19 |
| 1 | Sprint 1: Atoms | Badge, button, form components |
| ... | ... | ... |

**Total:** {count} milestones

[View Milestones](https://github.com/{owner}/{repo}/milestones)
```

## Error Handling

- Check if milestone exists before creating (API returns 422 if duplicate)
- Report existing milestones without failing
- Add delays between API calls for rate limiting
