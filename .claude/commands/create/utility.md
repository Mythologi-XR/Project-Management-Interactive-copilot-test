---
description: Create a new utility function module
argument-hint: [utility-name]
---

Create a utility module: **$1**

## Reference

- Architecture: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 3)
- Project structure: @CLAUDE.md

## Common Utilities to Create

Based on the architecture plan:

| Utility | Purpose |
|---------|---------|
| `formatters.js` | Number, date, file size formatting |
| `validators.js` | ID validation, input sanitization |
| `sanitize.js` | XSS protection for rich text |
| `logger.js` | Environment-aware logging |
| `cn.js` | Classname merging utility |

## Template

Create `src/utils/$1.js`:

```javascript
/**
 * $1 - [Description]
 *
 * Utility functions for [purpose]
 */

/**
 * [Function description]
 * @param {Type} param - Description
 * @returns {Type} Description
 */
export const functionName = (param) => {
  // Implementation
};

// Example: formatters.js
export const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const formatFileSize = (bytes) => {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

export const formatDate = (date, options = {}) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};
```

## Security Utilities

For `validators.js`:
```javascript
import { validate as isUUID } from 'uuid';

export const validateId = (id, fieldName = 'ID') => {
  if (!id) throw new Error(`${fieldName} is required`);
  if (typeof id !== 'string' || !isUUID(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  return id;
};
```

For `sanitize.js`:
```javascript
import DOMPurify from 'dompurify';

export const sanitizeHTML = (html, options = {}) => {
  const defaults = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'img', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'title', 'class']
  };
  return DOMPurify.sanitize(html, { ...defaults, ...options });
};
```

## Requirements

1. **Pure Functions** - No side effects where possible
2. **JSDoc Comments** - Document parameters and return values
3. **Error Handling** - Throw meaningful errors
4. **Testing** - Design for easy unit testing

## After Creation

1. Export from `src/utils/index.js` if barrel exists
2. Run `npm run lint`
