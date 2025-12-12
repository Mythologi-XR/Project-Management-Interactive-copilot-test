---
description: Implement error boundaries, request cancellation, and caching
---

Implement error handling and resilience patterns.

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/error-resilience.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 2)

## Overview

This command implements three resilience patterns:
1. **Error Boundaries** - Catch and handle React rendering errors
2. **Request Cancellation** - Cancel API requests on component unmount
3. **Request Caching** - Cache API responses to reduce redundant requests

---

## Task 2.1: Error Boundaries

### Create ErrorBoundary Component

Create `src/components/common/ErrorBoundary.jsx`:

```javascript
import { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorFallback from './ErrorFallback';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    // Send to error tracking service if configured
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
```

### Create ErrorFallback Component

Create `src/components/common/ErrorFallback.jsx`:

```javascript
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui';

function ErrorFallback({ error, resetError }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-h3 font-semibold text-label-primary mb-2">
        Something went wrong
      </h2>
      <p className="text-body text-label-secondary mb-6 max-w-md">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <Button
        variant="primary"
        leftIcon={<RefreshCw className="w-4 h-4" />}
        onClick={resetError}
      >
        Try Again
      </Button>
    </div>
  );
}

ErrorFallback.propTypes = {
  error: PropTypes.object,
  resetError: PropTypes.func.isRequired,
};

export default ErrorFallback;
```

---

## Task 2.2: Request Cancellation

### Create useAbortController Hook

Create `src/hooks/useAbortController.js`:

```javascript
import { useRef, useEffect, useCallback } from 'react';

export function useAbortController() {
  const controllerRef = useRef(null);

  const getController = useCallback(() => {
    // Abort previous request if exists
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    // Create new controller
    controllerRef.current = new AbortController();
    return controllerRef.current;
  }, []);

  const getSignal = useCallback(() => {
    return getController().signal;
  }, [getController]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return { getController, getSignal };
}

export default useAbortController;
```

---

## Task 2.3: Request Caching

### Create RequestCache Service

Create `src/services/requestCache.js`:

```javascript
const cache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const requestCache = {
  get(key) {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }

    return item.data;
  },

  set(key, data, ttl = DEFAULT_TTL) {
    cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  },

  invalidate(key) {
    cache.delete(key);
  },

  invalidatePattern(pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  },

  clear() {
    cache.clear();
  },
};

export default requestCache;
```

---

## Integration

### Wrap App with ErrorBoundary

In `src/App.jsx`:

```javascript
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      {/* Rest of app */}
    </ErrorBoundary>
  );
}
```

### Use in Hooks

```javascript
import { useAbortController } from './useAbortController';
import requestCache from '../services/requestCache';

export function useWorld(worldId) {
  const { getSignal } = useAbortController();

  const fetchWorld = async () => {
    const cacheKey = `world:${worldId}`;
    const cached = requestCache.get(cacheKey);
    if (cached) return cached;

    const data = await worldAPI.getById(worldId, { signal: getSignal() });
    requestCache.set(cacheKey, data);
    return data;
  };
}
```

## Verification

```bash
npm run lint
npm run build
```

## Success Criteria

- [ ] ErrorBoundary component created
- [ ] ErrorFallback component created
- [ ] useAbortController hook created
- [ ] RequestCache service created
- [ ] App wrapped with ErrorBoundary
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
