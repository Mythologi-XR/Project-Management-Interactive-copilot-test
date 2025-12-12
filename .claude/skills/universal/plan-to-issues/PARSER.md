# Plan Document Parser

> Logic for extracting structured data from architecture plan documents

## Overview

This document describes how to parse architecture optimization plan documents to extract sprints, tasks, acceptance criteria, and dependencies.

---

## Expected Document Structure

### Sprint Section Format

```markdown
## Sprint N: Sprint Name (Duration)

### Overview
[Sprint description]

### Tasks

#### Task N.1: Task Name
- Step 1
- Step 2

#### Task N.2: Task Name
...

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### Sprint Gate
[Gate requirements]
```

---

## Parsing Algorithm

### Step 1: Identify Sprint Boundaries

Search for sprint headers matching pattern:
```regex
^##\s+Sprint\s+(\d+):\s+(.+?)(?:\s+\((.+?)\))?$
```

Captures:
- Group 1: Sprint number (0-14)
- Group 2: Sprint name
- Group 3: Duration (optional)

### Step 2: Extract Tasks Within Sprint

For each sprint section, find task headers:
```regex
^####?\s+Task\s+(\d+)\.(\d+):\s+(.+)$
```

Or numbered list items:
```regex
^\d+\.\s+\*\*(.+?)\*\*
```

Captures:
- Task ID within sprint
- Task name
- Description (following lines until next task/section)

### Step 3: Extract Acceptance Criteria

Find acceptance criteria sections:
```regex
### Acceptance Criteria
([\s\S]+?)(?=###|$)
```

Parse checklist items:
```regex
^-\s+\[[ x]\]\s+(.+)$
```

### Step 4: Extract Gate Requirements

Find gate sections:
```regex
### Sprint Gate
([\s\S]+?)(?=##|$)
```

---

## Data Structure

### Parsed Plan Object

```typescript
interface ParsedPlan {
  title: string;
  version: string;
  sprints: Sprint[];
  totalTasks: number;
  totalGates: number;
}

interface Sprint {
  number: number;
  name: string;
  duration?: string;
  description: string;
  tasks: Task[];
  acceptanceCriteria: string[];
  gateRequirements: string[];
}

interface Task {
  id: string;           // "Sprint0.1"
  number: number;       // 1
  name: string;
  description: string;
  steps: string[];
  acceptanceCriteria: string[];
  agents: string[];     // From agent mapping
  skillFile?: string;
  dependencies: string[];  // Task IDs this depends on
  blocks: string[];        // Task IDs blocked by this
}
```

---

## Example Parsing

### Input (excerpt from plan)

```markdown
## Sprint 0: Foundation (Week 1-2)

Critical infrastructure setup including TypeScript, security, and React 19.

### Tasks

1. **TypeScript Installation & Configuration**
   - Install TypeScript and type definitions
   - Create tsconfig.json with strict settings
   - Configure Vite for TypeScript

2. **Core Type Definitions**
   - Create Directus collection types
   - Create API response types
   - Create component prop types

### Acceptance Criteria
- [ ] TypeScript compiles without errors
- [ ] All core types defined
- [ ] Build passes with `npm run build`

### Sprint Gate
- All tasks completed
- `npm run build` exits 0
- No TypeScript errors
```

### Output (parsed data)

```json
{
  "number": 0,
  "name": "Foundation",
  "duration": "Week 1-2",
  "description": "Critical infrastructure setup including TypeScript, security, and React 19.",
  "tasks": [
    {
      "id": "Sprint0.1",
      "number": 1,
      "name": "TypeScript Installation & Configuration",
      "steps": [
        "Install TypeScript and type definitions",
        "Create tsconfig.json with strict settings",
        "Configure Vite for TypeScript"
      ],
      "agents": ["typescript-setup"],
      "skillFile": ".claude/skills/v4/typescript-setup/SKILL.md"
    },
    {
      "id": "Sprint0.2",
      "number": 2,
      "name": "Core Type Definitions",
      "steps": [
        "Create Directus collection types",
        "Create API response types",
        "Create component prop types"
      ],
      "agents": ["typescript-types"],
      "skillFile": ".claude/skills/v4/typescript-types/SKILL.md"
    }
  ],
  "acceptanceCriteria": [
    "TypeScript compiles without errors",
    "All core types defined",
    "Build passes with `npm run build`"
  ],
  "gateRequirements": [
    "All tasks completed",
    "`npm run build` exits 0",
    "No TypeScript errors"
  ]
}
```

---

## Agent Mapping Integration

### Agent Mapping Document Format

```markdown
| Sprint | Task ID | Task Name | Primary Agent | Skill File |
|--------|---------|-----------|---------------|------------|
| 0 | 1 | TypeScript Setup | typescript-setup | typescript-setup/SKILL.md |
| 0 | 2 | Core Types | typescript-types | typescript-types/SKILL.md |
```

### Parsing Agent Mapping

```regex
^\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$
```

Captures:
- Sprint number
- Task ID
- Task name
- Agent name
- Skill file path

### Merging Agent Data

For each task in the plan:
1. Find matching row in agent mapping by sprint + task ID
2. Add `agents` array from primary agent column
3. Add `skillFile` path

---

## Dependency Detection

### Explicit Dependencies

Look for patterns like:
- "Depends on Task X.Y"
- "Requires completion of Sprint N"
- "After Task X.Y"

### Implicit Dependencies

Infer from task ordering:
- Tasks within a sprint generally depend on earlier tasks
- Sprint N tasks depend on Sprint N-1 gate

### Building Dependency Graph

```typescript
function buildDependencies(sprints: Sprint[]): void {
  for (const sprint of sprints) {
    // Each sprint depends on previous sprint's gate
    if (sprint.number > 0) {
      sprint.tasks[0].dependencies.push(`Sprint${sprint.number - 1}.G`);
    }

    // Sequential tasks within sprint
    for (let i = 1; i < sprint.tasks.length; i++) {
      // Add soft dependency on previous task
      sprint.tasks[i].dependencies.push(sprint.tasks[i - 1].id);
    }

    // Gate depends on all tasks in sprint
    // (handled separately in gate creation)
  }
}
```

---

## Validation

After parsing, validate:

1. **Sprint Continuity**: Sprints numbered 0 to N without gaps
2. **Task IDs**: Unique across entire plan
3. **Agent Coverage**: Every task has at least one agent assigned
4. **Criteria Existence**: Every sprint has acceptance criteria
5. **Gate Requirements**: Every sprint has gate requirements

```typescript
function validatePlan(plan: ParsedPlan): ValidationResult {
  const errors: string[] = [];

  // Check sprint numbers
  const sprintNumbers = plan.sprints.map(s => s.number).sort();
  for (let i = 0; i < sprintNumbers.length; i++) {
    if (sprintNumbers[i] !== i) {
      errors.push(`Missing Sprint ${i}`);
    }
  }

  // Check task uniqueness
  const taskIds = new Set<string>();
  for (const sprint of plan.sprints) {
    for (const task of sprint.tasks) {
      if (taskIds.has(task.id)) {
        errors.push(`Duplicate task ID: ${task.id}`);
      }
      taskIds.add(task.id);
    }
  }

  return { valid: errors.length === 0, errors };
}
```

---

## Output Formats

### For Issue Creation

```typescript
interface IssueData {
  title: string;      // "Sprint0.1 - TypeScript Installation"
  body: string;       // Full markdown body
  labels: string[];   // ["Sprint: 0"]
  milestone: string;  // "Sprint 0: Foundation"
}
```

### For Summary Report

```typescript
interface SummaryData {
  totalSprints: number;
  totalTasks: number;
  totalGates: number;
  sprintBreakdown: {
    sprint: number;
    name: string;
    taskCount: number;
    gateIssue: string;
  }[];
}
```
