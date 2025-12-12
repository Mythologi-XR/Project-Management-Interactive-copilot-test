---
description: Refactor a page component following the architecture optimization plan
argument-hint: [page-name]
---

Refactor the page component: **$1**

## Skill Reference

For detailed implementation guidance, see the appropriate domain refactor skill:
- Profile: @.claude/skills/domain-refactor-profile.md
- Team: @.claude/skills/domain-refactor-team.md
- Scene: @.claude/skills/domain-refactor-scene.md
- World: @.claude/skills/domain-refactor-world.md
- Library: @.claude/skills/domain-refactor-library.md
- Wallet: @.claude/skills/domain-refactor-wallet.md
- Others: @.claude/skills/domain-refactor-misc.md

## Reference Documents

First, read the refactoring guide for this page:
- Primary: @docs/REFACTOR-$1.md (if exists)
- Architecture: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md
- Unified: @docs/UNIFIED-COMPONENT-ARCHITECTURE.md

## Project Standards

Follow the conventions in @CLAUDE.md:
- Use design tokens over hardcoded values
- Use UI components from `src/components/ui/`
- Support dark mode via CSS variables
- Follow existing component patterns

## Refactoring Steps

1. **Analyze Current State**
   - Read the page file in `src/pages/`
   - Count lines and identify sections
   - List all inline components
   - List all hooks and state

2. **Extract Components**
   - Move inline components to appropriate directories:
     - Shared/reusable → `src/components/shared/`
     - Page-specific → `src/components/[page-name]/`
   - Follow naming conventions (PascalCase)

3. **Extract Hooks**
   - Move data fetching logic to `src/hooks/use[Name].js`
   - Return `{ data, loading, error }` pattern
   - Add request cancellation where appropriate

4. **Extract Constants**
   - Move mock data to `src/data/`
   - Move type mappings to `src/constants/`

5. **Simplify Page Component**
   - Page should be an orchestrator only
   - Target: <300 lines
   - Import extracted components and hooks

6. **Verify**
   - Run `npm run lint`
   - Run `npm run build`
   - Test the page manually

## Output

Provide a summary of:
- Components extracted
- Hooks created
- Line count before/after
- Any issues found
