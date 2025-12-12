---
description: Audit codebase for performance issues and optimization opportunities
---

Perform a performance audit of the ELYSIUM web app.

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/performance-auditor.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 1)
- Vite Config: @vite.config.js
- App Entry: @src/App.jsx

## Performance Checks

### 1. Bundle Size

Check current state:
- [ ] Run `npm run build` and check output sizes
- [ ] Identify largest chunks
- [ ] Check for code splitting

Target metrics:
- Initial bundle: <80KB gzipped
- Largest chunk: <150KB gzipped

### 2. Code Splitting

Check `src/App.jsx`:
- [ ] Pages use `React.lazy()` for dynamic imports
- [ ] Heavy libraries loaded on-demand
- [ ] Suspense boundaries in place

```javascript
// Should see:
const WorldDashboard = lazy(() => import('./pages/WorldDashboard'));

// Not:
import WorldDashboard from './pages/WorldDashboard';
```

### 3. Image Optimization

Check `src/services/directus.js`:
- [ ] `getAssetUrl()` supports width/height params
- [ ] WebP format used by default
- [ ] Quality optimization (70-85%)
- [ ] Proper sizing for thumbnails vs hero images

### 4. Vite Configuration

Check `vite.config.js`:
- [ ] Manual chunks for vendor libraries
- [ ] Compression plugin (Brotli/gzip)
- [ ] Bundle analyzer configured

Expected config:
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-maps': ['mapbox-gl'],
        'vendor-charts': ['recharts'],
      }
    }
  }
}
```

### 5. Console Logging

Check for production logs:
- [ ] Count `console.log` statements in `src/`
- [ ] Verify conditional logging (dev only)

Search:
```
grep -r "console.log" src/ | wc -l
```

### 6. React Performance

Check components for:
- [ ] Missing `useCallback` for callbacks passed to children
- [ ] Missing `useMemo` for expensive calculations
- [ ] Missing `React.memo` for frequently re-rendered components
- [ ] Unnecessary state updates

### 7. API Performance

Check for:
- [ ] Request caching implementation
- [ ] Request cancellation on unmount
- [ ] Debounced search inputs
- [ ] Pagination for large lists

## Output

Provide a performance report:

```markdown
## Performance Audit Report

### Bundle Analysis
- Current initial bundle: ~XXX KB
- Target: <80 KB
- Gap: XXX KB (XX% reduction needed)

### Critical Issues
| Issue | Impact | Location |
|-------|--------|----------|
| No code splitting | High | App.jsx |
| Unoptimized images | Medium | directus.js |

### Quick Wins
1. Add React.lazy() to page imports (-60% bundle)
2. Add image optimization params (-30% image transfer)
3. Configure manual chunks (-20% vendor size)

### Recommended Changes
1. vite.config.js changes
2. App.jsx code splitting
3. Image optimization
```
