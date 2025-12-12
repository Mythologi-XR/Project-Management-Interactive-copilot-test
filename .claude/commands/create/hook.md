---
description: Create a new custom React hook
argument-hint: [hook-name]
---

Create a custom hook: **$1**

## Reference

- Existing hooks: @src/hooks/
- API services: @src/services/directus.js
- Conventions: @CLAUDE.md

## Hook Template

Create `src/hooks/$1.js`:

```javascript
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * $1 - [Description of what this hook does]
 *
 * @param {Object} options - Hook options
 * @returns {Object} { data, loading, error, refetch }
 */
export const $1 = (options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AbortController for request cancellation
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // API call here
      const result = await someAPI.method({
        signal: abortControllerRef.current.signal,
        ...options
      });

      setData(result);
    } catch (err) {
      // Ignore abort errors
      if (err.name !== 'AbortError') {
        console.error('[directus] Error in $1:', err);
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchData();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default $1;
```

## Hook Types

### Data Fetching Hook
- Fetch data from Directus API
- Return `{ data, loading, error, refetch }`
- Include request cancellation

### UI State Hook
- Manage UI state (modals, toggles, etc.)
- Return state and handlers

### Utility Hook
- Reusable logic (debounce, local storage, etc.)
- Return computed values and functions

## Requirements

1. **Naming** - Start with `use` (e.g., `useWorld`, `useCarousel`)
2. **Return Pattern** - `{ data, loading, error }` for data hooks
3. **Cancellation** - Use AbortController for async operations
4. **Logging** - Use `[directus]` prefix for API-related logs
5. **Error Handling** - Catch and expose errors gracefully

## After Creation

Run `npm run lint` to verify no issues
