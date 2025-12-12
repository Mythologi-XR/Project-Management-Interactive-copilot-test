# Issue and Gate Templates

> Markdown templates for generating GitHub issues

## Task Issue Template

```markdown
## Objective

{task_description}

## Checklist

{steps_as_checklist}

## Acceptance Criteria

{acceptance_criteria_as_checklist}

## Validation

```bash
{validation_commands}
```

## AI Agents / Skills

- **Primary Agent:** `{primary_agent}`
- **Skill File:** @.claude/skills/{skill_path}
- **Slash Command:** `/{related_command}` (if applicable)

## Related

- **Sprint:** {sprint_number}
- **Milestone:** Sprint {sprint_number}: {sprint_name}
- **Plan Reference:** {plan_file_path}
{dependencies_section}
{blocks_section}
```

---

## Gate Issue Template

```markdown
## Sprint {sprint_number} Gate Verification

All tasks in Sprint {sprint_number} ({sprint_name}) must be completed and verified before proceeding to Sprint {next_sprint}.

## Pre-Gate Checklist

### Task Completion
{task_completion_checklist}

### Build & Lint Verification
- [ ] `npm run build` passes without errors
- [ ] `npm run lint` passes without errors
- [ ] No TypeScript errors: `npx tsc --noEmit`

### Sprint-Specific Criteria
{sprint_criteria_checklist}

## Validation Commands

```bash
# Build verification
npm run build

# Lint verification
npm run lint

# TypeScript check
npx tsc --noEmit

{additional_validation_commands}
```

## Sign-off

- [ ] All above criteria verified
- [ ] Sprint {sprint_number} is complete
- [ ] Ready to proceed to Sprint {next_sprint}

## Related Issues

### Sprint {sprint_number} Tasks
{task_issue_links}

### Previous Gate
{previous_gate_link}

### Next Gate
{next_gate_link}
```

---

## Template Variables

### Task Issue Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{task_id}` | Full task ID | `Sprint0.1` |
| `{task_name}` | Task title | `TypeScript Installation & Configuration` |
| `{task_description}` | Brief objective | `Install and configure TypeScript for the project` |
| `{steps_as_checklist}` | Task steps as checkboxes | `- [ ] Install TypeScript\n- [ ] Create tsconfig.json` |
| `{acceptance_criteria_as_checklist}` | Criteria as checkboxes | `- [ ] Build passes\n- [ ] No TS errors` |
| `{validation_commands}` | Shell commands to verify | `npm run build\nnpx tsc --noEmit` |
| `{primary_agent}` | AI agent name | `typescript-setup` |
| `{skill_path}` | Path to skill file (relative to .claude/skills/) | `v4/typescript-setup/SKILL.md` or `universal/github-project/SKILL.md` |
| `{plan_file_path}` | Path to the plan document | Read from command argument or config |
| `{sprint_number}` | Sprint number | `0` |
| `{sprint_name}` | Sprint name | `Foundation` |
| `{dependencies_section}` | Dependency links | `- **Depends on:** #33, #34` |
| `{blocks_section}` | Blocked-by links | `- **Blocks:** #35, #36` |

### Gate Issue Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{sprint_number}` | Current sprint | `0` |
| `{sprint_name}` | Sprint name | `Foundation` |
| `{next_sprint}` | Next sprint number | `1` |
| `{task_completion_checklist}` | All tasks as checkboxes | `- [ ] Sprint0.1 completed\n- [ ] Sprint0.2 completed` |
| `{sprint_criteria_checklist}` | Sprint acceptance criteria | `- [ ] TypeScript configured\n- [ ] Security fixes applied` |
| `{additional_validation_commands}` | Sprint-specific commands | `grep -r "access_token" src/` |
| `{task_issue_links}` | Links to task issues | `- #33 Sprint0.1\n- #34 Sprint0.2` |
| `{previous_gate_link}` | Link to previous gate | `- Previous: #114 Sprint -1 Gate` or `- Previous: N/A (first sprint)` |
| `{next_gate_link}` | Link to next gate | `- Next: #116 Sprint 1 Gate` |

---

## Example: Generated Task Issue

**Title:** `Sprint0.1 - TypeScript Installation & Configuration`

**Body:**
```markdown
## Objective

Install TypeScript and configure the project for type-safe development. This is the foundational step for the TypeScript migration.

## Checklist

- [ ] Install TypeScript: `npm install -D typescript`
- [ ] Install type definitions: `npm install -D @types/react @types/react-dom @types/node`
- [ ] Create `tsconfig.json` with strict settings
- [ ] Configure Vite for TypeScript support
- [ ] Update `vite.config.js` to `vite.config.ts`
- [ ] Verify build works: `npm run build`

## Acceptance Criteria

- [ ] TypeScript installed as dev dependency
- [ ] `tsconfig.json` exists with strict mode enabled
- [ ] Vite configured for TypeScript
- [ ] `npm run build` passes without errors
- [ ] No regressions in existing functionality

## Validation

```bash
# Verify TypeScript installation
npm list typescript

# Check TypeScript version
npx tsc --version

# Verify build
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## AI Agents / Skills

- **Primary Agent:** `typescript-setup`
- **Skill File:** @.claude/skills/v4/typescript-setup/SKILL.md
- **Slash Command:** `/typescript-migration`

## Related

- **Sprint:** 0
- **Milestone:** Sprint 0: Foundation
- **Plan Reference:** [Plan Document](path/to/plan-document.md)
- **Dependencies:** None (first task)
- **Blocks:** #34, #35, #36 (subsequent Sprint 0 tasks)
```

---

## Example: Generated Gate Issue

**Title:** `Sprint0.G - Sprint 0 Gate`

**Body:**
```markdown
## Sprint 0 Gate Verification

All tasks in Sprint 0 (Foundation) must be completed and verified before proceeding to Sprint 1.

## Pre-Gate Checklist

### Task Completion
- [ ] #33 Sprint0.1 - TypeScript Installation & Configuration
- [ ] #34 Sprint0.2 - Core Type Definitions
- [ ] #35 Sprint0.3 - Build System Consolidation
- [ ] #36 Sprint0.4 - Vite Configuration Enhancement
- [ ] #37 Sprint0.5 - React 19 Compiler Setup
- [ ] #38 Sprint0.6 - Token Security (Backend Proxy)
- [ ] #39 Sprint0.7 - Input Validation Infrastructure
- [ ] #40 Sprint0.8 - XSS Protection Utilities
- [ ] #41 Sprint0.9 - Directory Structure Setup
- [ ] #42 Sprint0.10 - Design Token Constants
- [ ] #43 Sprint0.11 - Error Handling Infrastructure
- [ ] #44 Sprint0.12 - Request Cancellation Hook
- [ ] #45 Sprint0.13 - Caching Layer
- [ ] #46 Sprint0.14 - State Management Hooks
- [ ] #47 Sprint0.15 - Sprint 0 Gate Verification

### Build & Lint Verification
- [ ] `npm run build` passes without errors
- [ ] `npm run lint` passes without errors
- [ ] No TypeScript errors: `npx tsc --noEmit`

### Sprint-Specific Criteria
- [ ] TypeScript properly configured with strict mode
- [ ] All security vulnerabilities addressed
- [ ] React 19 compiler integration working
- [ ] Foundation directory structure created
- [ ] Core hooks and utilities in place
- [ ] Error boundaries implemented

## Validation Commands

```bash
# Build verification
npm run build

# Lint verification
npm run lint

# TypeScript check
npx tsc --noEmit

# Security validation - no exposed tokens
grep -r "access_token" src/ | grep -v ".test." | wc -l
# Expected: 0

# Verify directory structure
ls -la src/components/ui/
ls -la src/hooks/
ls -la src/utils/

# Test error boundary
npm run test -- --grep "ErrorBoundary"
```

## Sign-off

- [ ] All above criteria verified
- [ ] Sprint 0 is complete
- [ ] Ready to proceed to Sprint 1

## Related Issues

### Sprint 0 Tasks
- #33 Sprint0.1 - TypeScript Installation & Configuration
- #34 Sprint0.2 - Core Type Definitions
- #35 Sprint0.3 - Build System Consolidation
- #36 Sprint0.4 - Vite Configuration Enhancement
- #37 Sprint0.5 - React 19 Compiler Setup
- #38 Sprint0.6 - Token Security (Backend Proxy)
- #39 Sprint0.7 - Input Validation Infrastructure
- #40 Sprint0.8 - XSS Protection Utilities
- #41 Sprint0.9 - Directory Structure Setup
- #42 Sprint0.10 - Design Token Constants
- #43 Sprint0.11 - Error Handling Infrastructure
- #44 Sprint0.12 - Request Cancellation Hook
- #45 Sprint0.13 - Caching Layer
- #46 Sprint0.14 - State Management Hooks
- #47 Sprint0.15 - Sprint 0 Gate Verification

### Previous Gate
- Previous: N/A (first sprint)

### Next Gate
- Next: Sprint1.G - Sprint 1 Gate
```

---

## Template Rendering Function

```typescript
function renderTaskIssue(task: Task, sprint: Sprint): IssueData {
  const steps = task.steps.map(s => `- [ ] ${s}`).join('\n');
  const criteria = task.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n');

  const body = `## Objective

${task.description}

## Checklist

${steps}

## Acceptance Criteria

${criteria}

## Validation

\`\`\`bash
npm run build
npm run lint
npx tsc --noEmit
\`\`\`

## AI Agents / Skills

- **Primary Agent:** \`${task.agents[0]}\`
- **Skill File:** @.claude/skills/${task.skillFile}

## Related

- **Sprint:** ${sprint.number}
- **Milestone:** Sprint ${sprint.number}: ${sprint.name}
- **Plan Reference:** [Plan Document](${config.planFilePath})
${task.dependencies.length > 0 ? `- **Depends on:** ${task.dependencies.map(d => `#${d}`).join(', ')}` : ''}
${task.blocks.length > 0 ? `- **Blocks:** ${task.blocks.map(b => `#${b}`).join(', ')}` : ''}`;

  return {
    title: `${task.id} - ${task.name}`,
    body,
    labels: [`Sprint: ${sprint.number}`],
    milestone: `Sprint ${sprint.number}: ${sprint.name}`
  };
}
```

---

## Label Specifications

### Sprint Labels

| Label | Color | Description |
|-------|-------|-------------|
| `Sprint: 0` | `#0E8A16` | Foundation sprint |
| `Sprint: 1` | `#1D76DB` | Atoms sprint 1 |
| `Sprint: 2` | `#0052CC` | Atoms sprint 2 |
| `Sprint: 3` | `#5319E7` | Molecules sprint 1 |
| `Sprint: 4` | `#7057FF` | Molecules sprint 2 |
| `Sprint: 5` | `#008672` | Organisms sprint 1 |
| `Sprint: 6` | `#00B4D8` | Organisms sprint 2 |
| `Sprint: 7` | `#0077B6` | Organisms sprint 3 |
| `Sprint: 8` | `#023E8A` | Organisms sprint 4 |
| `Sprint: 9` | `#03045E` | Organisms sprint 5 |
| `Sprint: 10` | `#6A0572` | Organisms sprint 6 |
| `Sprint: 11` | `#A4133C` | Page assembly 1 |
| `Sprint: 12` | `#C9184A` | Page assembly 2 |
| `Sprint: 13` | `#FF4D6D` | Testing |
| `Sprint: 14` | `#D00000` | Pre-production |

### Type Labels

| Label | Color | Description |
|-------|-------|-------------|
| `gate` | `#D93F0B` | Sprint gate verification |
| `task` | `#5319E7` | Implementation task |
| `security` | `#B60205` | Security-related |
| `typescript` | `#3178C6` | TypeScript migration |
| `react19` | `#61DAFB` | React 19 features |
