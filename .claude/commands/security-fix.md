---
description: Apply critical security fixes from the architecture plan
argument-hint: [fix-type]
---

Apply security fix: **$1**

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/security-hardening.md

## Available Fix Types

| Type | Description | Reference |
|------|-------------|-----------|
| `token` | Remove token from asset URLs | Task 0.1 |
| `validation` | Add input validation layer | Task 0.2 |
| `duplicate` | Remove duplicate token config | Task 0.3 |
| `xss` | Add XSS protection for rich text | Task 0.4 |
| `all` | Apply all security fixes | Phase 0 |

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 0)
- API Service: @src/services/directus.js

---

## Fix: Token in Asset URLs (Task 0.1)

**Problem:** API token exposed in browser network inspector via asset URLs.

**Current code in `src/services/directus.js`:**
```javascript
const url = token
  ? `${directusUrl}/assets/${fileId}?access_token=${token}`
  : `${directusUrl}/assets/${fileId}`;
```

**Solution:**
1. Create backend proxy endpoint `/api/assets/:fileId`
2. Update `getAssetUrl()` to use proxy path
3. Add image transform parameters

**New implementation:**
```javascript
export const getAssetUrl = (fileId, options = {}) => {
  if (!fileId) return null;

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fit = 'cover'
  } = options;

  const params = new URLSearchParams({
    format,
    quality: String(quality),
    fit,
    ...(width && { width: String(width) }),
    ...(height && { height: String(height) })
  });

  return `/api/assets/${fileId}?${params}`;
};
```

---

## Fix: Input Validation (Task 0.2)

**Problem:** API methods accept unvalidated IDs.

**Steps:**
1. Install uuid package: `npm install uuid`
2. Create `src/utils/validators.js`
3. Add validation to API methods

**Validator code:**
```javascript
// src/utils/validators.js
import { validate as isUUID } from 'uuid';

export const validateId = (id, fieldName = 'ID') => {
  if (!id) throw new Error(`${fieldName} is required`);
  if (typeof id !== 'string' || !isUUID(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  return id;
};

export const sanitizeError = (error) => {
  // Remove internal paths from error messages
  const message = error.message || 'An error occurred';
  return message.replace(/\/Users\/[^\s]+/g, '[path]');
};
```

---

## Fix: Duplicate Token Config (Task 0.3)

**Problem:** `SceneDashboard.jsx` has inline Directus configuration.

**Steps:**
1. Search for duplicate token/URL definitions
2. Remove inline configuration
3. Ensure all API calls use `src/services/directus.js`

**Search:**
```bash
grep -r "VITE_DIRECTUS" src/pages/
grep -r "createDirectus" src/pages/
```

---

## Fix: XSS Protection (Task 0.4)

**Problem:** Rich text content rendered without sanitization.

**Steps:**
1. Install DOMPurify: `npm install dompurify`
2. Create `src/utils/sanitize.js`
3. Wrap all `innerHTML`/`dangerouslySetInnerHTML` usage

**Sanitizer code:**
```javascript
// src/utils/sanitize.js
import DOMPurify from 'dompurify';

export const sanitizeHTML = (html, options = {}) => {
  const defaults = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'img', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'title', 'class']
  };
  return DOMPurify.sanitize(html, { ...defaults, ...options });
};

export const sanitizeText = (text) => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};
```

**Usage:**
```jsx
// Instead of:
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// Use:
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userContent) }} />
```

---

## Verification

After applying fixes:
1. Run `npm run build`
2. Run `npm run lint`
3. Check browser network inspector for tokens
4. Test XSS with `<script>alert('xss')</script>` input
