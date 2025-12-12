---
description: Validate all pre-production gates before deployment
---

Run pre-production gate validation.

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/pre-production-gate.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 12)

## Overview

This command validates all pre-production requirements:
1. Code quality gates
2. Bundle size limits
3. Performance benchmarks
4. Security checks
5. Functional tests
6. Cross-platform verification

---

## Gate 1: Code Quality

### 1.1 Lint Check
```bash
npm run lint
```
**Criteria:** Exit code 0, zero errors

### 1.2 Build Check
```bash
npm run build
```
**Criteria:** Exit code 0, no errors

### 1.3 Type Check (if TypeScript)
```bash
npm run type-check
```
**Criteria:** Exit code 0, no errors

---

## Gate 2: Bundle Size

### 2.1 Build and Check Sizes
```bash
npm run build
ls -la dist/assets/
```

### 2.2 Size Criteria

| Metric | Target | Status |
|--------|--------|--------|
| Initial JS bundle | <80KB gzipped | |
| Largest chunk | <150KB gzipped | |
| Total JS | <500KB gzipped | |
| CSS bundle | <50KB gzipped | |

### 2.3 Check with gzip
```bash
# Check gzipped sizes
gzip -k dist/assets/*.js
ls -la dist/assets/*.gz
```

---

## Gate 3: Performance

### 3.1 Lighthouse Audit

Run Lighthouse on all main pages:
- `/` (World Discovery)
- `/profile`
- `/world/:id`
- `/scene/:id`
- `/library`
- `/wallet`
- `/team`
- `/community`
- `/quests`
- `/settings`
- `/starred`
- `/collections`

### 3.2 Performance Criteria

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥80 |
| Lighthouse Accessibility | ≥90 |
| First Contentful Paint | <1.5s |
| Largest Contentful Paint | <2.5s |
| Cumulative Layout Shift | <0.1 |
| Time to Interactive | <3.5s |

### 3.3 Code Splitting Verification
- [ ] All pages use `React.lazy()`
- [ ] Suspense boundaries in place
- [ ] Heavy libraries in separate chunks

---

## Gate 4: Security

### 4.1 Dependency Audit
```bash
npm audit
```
**Criteria:** No critical or high vulnerabilities

### 4.2 Token Exposure Check
```bash
grep -r "access_token" src/
grep -r "VITE_DIRECTUS_TOKEN" src/
```
**Criteria:** Token not exposed in client code or URLs

### 4.3 XSS Prevention
- [ ] All `dangerouslySetInnerHTML` uses sanitization
- [ ] User inputs validated
- [ ] Error messages sanitized

### 4.4 HTTPS & Headers
- [ ] All external requests use HTTPS
- [ ] Security headers configured in Vite

---

## Gate 5: Functional Tests

### 5.1 Unit Tests
```bash
npm run test:run
npm run test:coverage
```
**Criteria:** All tests pass, ≥60% coverage

### 5.2 E2E Tests
```bash
npm run test:e2e
```
**Criteria:** All tests pass

### 5.3 Accessibility Tests
```bash
npm run test -- --grep "accessibility"
```
**Criteria:** No accessibility violations

---

## Gate 6: Cross-Platform

### 6.1 Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 6.2 Mobile Testing
- [ ] iOS Safari
- [ ] Android Chrome

### 6.3 Responsive Testing
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px)
- [ ] Wide (1440px)

### 6.4 Dark Mode
- [ ] All pages render correctly in dark mode
- [ ] Contrast ratios maintained
- [ ] No invisible elements

---

## Gate 7: Page QA Checklist

Run through each page:

### All Pages
- [ ] Loads without errors
- [ ] All interactive elements work
- [ ] Loading states display correctly
- [ ] Error states handled gracefully
- [ ] Dark mode works

### World Discovery
- [ ] Worlds load and display
- [ ] Search works
- [ ] Filters work
- [ ] Infinite scroll works

### Profile
- [ ] Profile data loads
- [ ] Edit profile works
- [ ] Tabs switch correctly
- [ ] Followers/following modals work

### World Dashboard
- [ ] World data loads
- [ ] Edit mode works
- [ ] Scene list displays
- [ ] Analytics display

### Scene Dashboard
- [ ] Scene data loads
- [ ] Map displays correctly
- [ ] Edit mode works

### Library
- [ ] Items load
- [ ] Grid/list toggle works
- [ ] Search/filter works
- [ ] Collection carousel works
- [ ] Drag-and-drop works

### Wallet
- [ ] Currency cards display
- [ ] Badge carousel works
- [ ] Rewards sections load
- [ ] All modals work

### Team
- [ ] Team data loads
- [ ] Navigation works
- [ ] Charts display
- [ ] Settings work

---

## Pre-Production Report

```markdown
## Pre-Production Gate Report

**Date:** [Date]
**Build:** [Version/Hash]

### Gate Summary

| Gate | Status | Notes |
|------|--------|-------|
| 1. Code Quality | ✅/❌ | |
| 2. Bundle Size | ✅/❌ | Initial: XXkb |
| 3. Performance | ✅/❌ | LH Score: XX |
| 4. Security | ✅/❌ | |
| 5. Tests | ✅/❌ | Coverage: XX% |
| 6. Cross-Platform | ✅/❌ | |
| 7. Page QA | ✅/❌ | |

### Blockers
- [List any blocking issues]

### Recommendations
- [Any recommendations before deployment]

### Approval
- [ ] All gates passed
- [ ] Ready for production deployment
```

---

## Quick Validation Script

```bash
#!/bin/bash
echo "Running pre-production gates..."

echo "Gate 1: Lint"
npm run lint || exit 1

echo "Gate 2: Build"
npm run build || exit 1

echo "Gate 3: Tests"
npm run test:run || exit 1

echo "Gate 4: Security Audit"
npm audit --audit-level=high || echo "Warning: Security issues found"

echo "All automated gates passed!"
```

## Success Criteria

- [ ] All 7 gates pass
- [ ] No critical blockers
- [ ] Report generated and approved
- [ ] Ready for deployment
