---
description: Perform a security audit on the codebase
---

Perform a comprehensive security audit of the ELYSIUM web app.

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/security-auditor.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 0)
- API Service: @src/services/directus.js

## Critical Security Checks

### 1. Token Exposure (CRITICAL)

Check `src/services/directus.js` for:
- [ ] API token in asset URLs (`access_token=` in URL params)
- [ ] Token exposed in client-side code
- [ ] Token in localStorage/sessionStorage

Search pattern:
```
grep -r "access_token" src/
grep -r "VITE_DIRECTUS_TOKEN" src/
```

### 2. Duplicate Configuration

Check for inline Directus configuration in pages:
- [ ] `src/pages/SceneDashboard.jsx` - known issue
- [ ] Other pages with duplicate token/URL definitions

All API calls should route through `src/services/directus.js`

### 3. XSS Vulnerabilities

Check for unsanitized HTML:
- [ ] `dangerouslySetInnerHTML` usage
- [ ] `innerHTML` assignments
- [ ] Rich text editor output

Search pattern:
```
grep -r "dangerouslySetInnerHTML" src/
grep -r "innerHTML" src/
```

### 4. Input Validation

Check API methods for:
- [ ] ID validation before API calls
- [ ] User input sanitization
- [ ] Error message sanitization (no internal paths)

### 5. Console Logging

Check for sensitive data in logs:
- [ ] Token values logged
- [ ] User credentials logged
- [ ] Internal paths exposed

### 6. Environment Variables

Check `.env` and code:
- [ ] No hardcoded secrets
- [ ] `.env` in `.gitignore`
- [ ] Environment variables properly prefixed with `VITE_`

## Remediation

### Token in Asset URLs
Create backend proxy or use Directus public assets:
```javascript
// Instead of:
`${url}/assets/${id}?access_token=${token}`

// Use:
`/api/assets/${id}` // Via backend proxy
```

### XSS Prevention
Install and use DOMPurify:
```javascript
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userContent);
```

### Input Validation
Add validators:
```javascript
import { validate as isUUID } from 'uuid';
if (!isUUID(id)) throw new Error('Invalid ID');
```

## Output

Provide a security report:

```markdown
## Security Audit Report

### Critical Findings
| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| Token in URLs | CRITICAL | directus.js:21 | Open |

### Recommendations
1. Immediate actions
2. Short-term fixes
3. Long-term improvements

### Files Needing Review
- file1.jsx - reason
- file2.js - reason
```
