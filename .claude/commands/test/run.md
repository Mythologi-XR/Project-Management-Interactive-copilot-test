---
description: Run tests and verify build passes
argument-hint: [test-type]
---

Run tests: **$1**

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/test-runner.md

## Test Types

| Type | Command | Description |
|------|---------|-------------|
| `build` | `npm run build` | Verify production build |
| `lint` | `npm run lint` | Check code style |
| `unit` | `npm run test` | Run unit tests (if configured) |
| `all` | All of above | Full verification |

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 11)

---

## Build Verification

Run and check:
```bash
npm run build
```

**Expected output:**
- Exit code 0
- No errors
- Bundle size reported

**Check for:**
- [ ] Build completes successfully
- [ ] No TypeScript/JSX errors
- [ ] Initial bundle <80KB gzipped
- [ ] No warnings about chunk sizes

---

## Lint Verification

Run and check:
```bash
npm run lint
```

**Expected output:**
- Exit code 0
- No errors

**Common issues:**
- Unused imports
- Missing dependencies in useEffect
- Undefined variables

---

## Unit Tests (if configured)

Run:
```bash
npm run test
```

**Coverage targets:**
- Utilities: >=60%
- Components: >=50%

---

## Pre-commit Checklist

Before committing changes:

```bash
# Full verification
npm run lint && npm run build

# If tests configured
npm run lint && npm run test && npm run build
```

---

## Bundle Analysis

After build, check bundle sizes:

1. Look at build output for chunk sizes
2. If `bundle-stats.html` exists, open it
3. Identify largest chunks

**Size targets:**
| Metric | Target |
|--------|--------|
| Initial JS | <80KB gzipped |
| Largest chunk | <150KB gzipped |
| Total assets | <500KB gzipped |
| CSS bundle | <50KB gzipped |

---

## Troubleshooting

### Build fails with import errors
- Check file paths are correct
- Verify exports match imports
- Check for circular dependencies

### Lint fails
- Run `npm run lint -- --fix` for auto-fixable issues
- Manually fix remaining issues

### Tests fail
- Check test file matches component
- Verify mocks are set up correctly
- Check for async timing issues
