---
description: Extract data fetching logic into a custom hook
argument-hint: [source-file] [hook-name]
---

Extract a custom hook **$2** from **$1**

## Steps

1. **Analyze Source File**
   - Read @src/pages/$1 or @src/components/$1
   - Identify data fetching logic (useEffect + useState patterns)
   - List API calls being made

2. **Create Hook File**
   - Create `src/hooks/$2.js`
   - Follow naming convention: `use[ResourceName]`

3. **Hook Structure**
   ```javascript
   import { useState, useEffect, useCallback } from 'react';
   import { resourceAPI } from '../services/directus';

   export const $2 = (params) => {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     const fetchData = useCallback(async () => {
       try {
         setLoading(true);
         const result = await resourceAPI.method(params);
         setData(result);
       } catch (err) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
     }, [params]);

     useEffect(() => {
       fetchData();
     }, [fetchData]);

     return { data, loading, error, refetch: fetchData };
   };
   ```

4. **Add Request Cancellation** (if appropriate)
   - Use AbortController for cleanup
   - Handle component unmount

5. **Update Source File**
   - Import the new hook
   - Replace inline logic with hook call
   - Remove unused imports

6. **Verify**
   - Run `npm run lint`
   - Test the functionality

## Standards (@CLAUDE.md)

- Return `{ data, loading, error }` pattern
- Use services from `src/services/directus.js`
- Add `[directus]` prefix to console logs
