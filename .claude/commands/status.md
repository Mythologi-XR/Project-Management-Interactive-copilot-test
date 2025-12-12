---
description: Check project status against architecture optimization targets
---

Check ELYSIUM project status against Architecture Optimization Plan targets.

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md

## Status Checks

### 1. Code Metrics

Run these checks:

```bash
# Count lines per page file
wc -l src/pages/*.jsx

# Find largest files
find src -name "*.jsx" -exec wc -l {} \; | sort -rn | head -20

# Count total lines
find src -name "*.jsx" -o -name "*.js" | xargs wc -l | tail -1
```

**Targets:**
| Metric | Target |
|--------|--------|
| Largest page | <300 lines |
| Total page lines | ~2,400 (from 26,121) |

### 2. Bundle Size

```bash
npm run build
```

**Targets:**
| Metric | Target |
|--------|--------|
| Initial bundle | <80KB gzipped |
| Largest chunk | <150KB gzipped |

### 3. Build Health

```bash
npm run lint
npm run build
npm run test  # if configured
```

**Targets:**
- [ ] Zero lint errors
- [ ] Zero build errors
- [ ] All tests passing

### 4. Security Status

Check for:
- [ ] No tokens in asset URLs (Task 0.1)
- [ ] Input validation in place (Task 0.2)
- [ ] No duplicate configs (Task 0.3)
- [ ] XSS protection active (Task 0.4)

```bash
# Check for token exposure
grep -r "access_token" src/
```

### 5. Architecture Status

Check directory structure:
```bash
ls -la src/components/shared/
ls -la src/utils/
ls -la src/constants/
ls -la src/data/
```

**Expected directories:**
- [ ] `src/components/shared/cards/`
- [ ] `src/components/shared/lists/`
- [ ] `src/components/shared/modals/`
- [ ] `src/components/shared/filters/`
- [ ] `src/components/common/`
- [ ] `src/utils/`
- [ ] `src/constants/`

### 6. Code Splitting

Check `src/App.jsx`:
- [ ] Pages imported with `React.lazy()`
- [ ] Suspense boundary in place

### 7. Testing Coverage

```bash
npm run test:coverage  # if configured
```

**Targets:**
| Area | Target |
|------|--------|
| Utilities | >=60% |
| Components | >=50% |

---

## Progress Summary Template

```markdown
## Project Status Report

**Date:** [Date]

### Phase Progress
| Phase | Status | Notes |
|-------|--------|-------|
| 0 Security | ⬜/🟨/✅ | |
| 1 Build | ⬜/🟨/✅ | |
| 2 Error Handling | ⬜/🟨/✅ | |
| 3 Foundation | ⬜/🟨/✅ | |
| 4 UI Components | ⬜/🟨/✅ | |
| 5 Shared Components | ⬜/🟨/✅ | |
| 6 Domain Extraction | ⬜/🟨/✅ | |
| 7 Deduplication | ⬜/🟨/✅ | |
| 8 State Management | ⬜/🟨/✅ | |
| 9 Accessibility | ⬜/🟨/✅ | |
| 10 TypeScript | ⬜/🟨/✅ | |
| 11 Testing | ⬜/🟨/✅ | |
| 12 Pre-Production | ⬜/🟨/✅ | |

### Key Metrics
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Initial bundle | XXX KB | <80KB | 🔴/🟡/🟢 |
| Largest page | XXX lines | <300 | 🔴/🟡/🟢 |
| Lint errors | X | 0 | 🔴/🟡/🟢 |
| Build errors | X | 0 | 🔴/🟡/🟢 |

### Blockers
- None / List any blockers

### Next Steps
1. Priority action 1
2. Priority action 2
```
