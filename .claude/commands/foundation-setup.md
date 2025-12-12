---
description: Create directory structure, utilities, and contexts
---

Set up foundation architecture: directories, utilities, and contexts.

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/foundation-setup.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 3)
- Unified Architecture: @docs/UNIFIED-COMPONENT-ARCHITECTURE.md (Phase 0)

## Overview

This command creates the foundational structure for the refactored codebase:
1. Directory structure
2. Utility functions
3. Essential contexts
4. Barrel exports

---

## Task 3.1: Create Directory Structure

Create these directories (they don't exist yet):

```bash
mkdir -p src/utils
mkdir -p src/constants
mkdir -p src/data
mkdir -p src/components/shared/cards
mkdir -p src/components/shared/lists
mkdir -p src/components/shared/modals
mkdir -p src/components/shared/filters
mkdir -p src/components/common
mkdir -p src/components/charts
```

---

## Task 3.2: Create Utility Functions

### Create formatters.js

Create `src/utils/formatters.js`:

```javascript
/**
 * Format a number with K/M/B suffixes
 */
export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0';

  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return String(num);
}

/**
 * Format a date relative to now
 */
export function formatRelativeDate(date) {
  if (!date) return '';

  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString();
}

/**
 * Format a date to a readable string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';

  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
```

### Create validators.js

Create `src/utils/validators.js`:

```javascript
import { validate as isUUID } from 'uuid';

/**
 * Validate a UUID
 */
export function validateId(id, fieldName = 'ID') {
  if (!id) throw new Error(`${fieldName} is required`);
  if (typeof id !== 'string' || !isUUID(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  return id;
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize error message (remove internal paths)
 */
export function sanitizeError(error) {
  const message = error?.message || 'An error occurred';
  return message.replace(/\/Users\/[^\s]+/g, '[path]');
}
```

---

## Task 3.3: Create Essential Contexts

### Create AuthContext

Create `src/context/AuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (credentials) => {
    // Implement login logic
    setLoading(true);
    try {
      // const user = await authAPI.login(credentials);
      // setUser(user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // Implement logout logic
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
```

### Create NotificationContext

Create `src/context/NotificationContext.jsx`:

```javascript
import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, ...notification }]);

    // Auto-dismiss after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = {
    success: (message, options = {}) =>
      addNotification({ type: 'success', message, ...options }),
    error: (message, options = {}) =>
      addNotification({ type: 'error', message, ...options }),
    warning: (message, options = {}) =>
      addNotification({ type: 'warning', message, ...options }),
    info: (message, options = {}) =>
      addNotification({ type: 'info', message, ...options }),
  };

  return (
    <NotificationContext.Provider value={{ notifications, notify, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export default NotificationContext;
```

---

## Task 3.4: Create Barrel Exports

### Create utils/index.js

Create `src/utils/index.js`:

```javascript
export * from './formatters';
export * from './validators';
```

### Create components/common/index.js

Create `src/components/common/index.js`:

```javascript
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ErrorFallback } from './ErrorFallback';
```

### Create components/shared/index.js

Create `src/components/shared/index.js`:

```javascript
// Cards
export * from './cards';

// Lists
export * from './lists';

// Modals
export * from './modals';

// Filters
export * from './filters';
```

---

## Verification

```bash
npm run lint
npm run build
```

## Success Criteria

- [ ] All directories created
- [ ] `formatters.js` created with all functions
- [ ] `validators.js` created
- [ ] `AuthContext` created
- [ ] `NotificationContext` created
- [ ] Barrel exports created
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
