---
description: Audit a page for optimization opportunities and issues
argument-hint: [page-name]
---

Audit the page: **$1**

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md
- Refactor Guide: @docs/REFACTOR-$1.md (if exists)
- Conventions: @CLAUDE.md

## Audit Checklist

### 1. Code Metrics

- [ ] Count total lines (target: <300 for page orchestrator)
- [ ] Count inline components
- [ ] Count useState/useEffect hooks
- [ ] Identify API calls

### 2. Component Structure

- [ ] Identify components that could be extracted
- [ ] Check for duplicate code patterns
- [ ] Verify use of UI components from `src/components/ui/`
- [ ] Check for hardcoded styles vs design tokens

### 3. Performance Issues

- [ ] Check for missing `useCallback`/`useMemo`
- [ ] Identify expensive computations in render
- [ ] Check for unnecessary re-renders
- [ ] Verify images use `getAssetUrl()` with optimization

### 4. Security Issues

- [ ] Check for exposed API tokens
- [ ] Check for `innerHTML` without sanitization
- [ ] Check for inline Directus configuration
- [ ] Verify input validation

### 5. Accessibility

- [ ] Check for missing ARIA labels
- [ ] Check for keyboard navigation support
- [ ] Verify focus management in modals

### 6. Design System Compliance

- [ ] Using design tokens for colors
- [ ] Using design tokens for spacing
- [ ] Using design tokens for typography
- [ ] Dark mode support

## Analysis Steps

1. Read the page file: `src/pages/$1.jsx`
2. Count lines and components
3. Identify issues in each category
4. Prioritize by impact

## Output Report

Provide a report with:

```markdown
## Audit Report: $1

### Metrics
- Total Lines: X
- Inline Components: X
- Hooks: X useState, X useEffect
- API Calls: X

### Critical Issues
- [ ] Issue 1 (Security/Performance)
- [ ] Issue 2

### Extraction Candidates
| Component | Lines | Destination |
|-----------|-------|-------------|
| Name | ~X | src/components/... |

### Design System Violations
- [ ] Hardcoded color at line X
- [ ] Missing dark mode support

### Recommendations
1. Priority 1 actions
2. Priority 2 actions
```
