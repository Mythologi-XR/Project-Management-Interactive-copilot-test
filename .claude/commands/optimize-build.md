---
description: Apply build and performance optimizations from the architecture plan
---

Apply build optimizations from the Architecture Optimization Plan.

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/build-optimization.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 1)
- Current Config: @vite.config.js
- App Entry: @src/App.jsx

## Step 1: Install Build Plugins

```bash
npm install -D rollup-plugin-visualizer vite-plugin-compression
```

## Step 2: Enhance Vite Configuration

Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
    compression({ algorithm: 'brotliCompress' }),
    compression({ algorithm: 'gzip' }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Heavy libraries - load on demand
          'vendor-maps': ['mapbox-gl', 'react-map-gl'],
          'vendor-charts': ['recharts'],
          'vendor-editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-link'],
        }
      }
    },
    chunkSizeWarningLimit: 500,
    sourcemap: true,
  },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
    }
  }
});
```

## Step 3: Implement Code Splitting

Update `src/App.jsx`:

```javascript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoadingState } from './components/ui';

// Lazy load all pages
const WorldDiscoveryPage = lazy(() => import('./pages/WorldDiscovery'));
const CommunityPage = lazy(() => import('./pages/Community'));
const Library = lazy(() => import('./pages/Library'));
const Collections = lazy(() => import('./pages/Collections'));
const SceneDashboard = lazy(() => import('./pages/SceneDashboard'));
const WorldDashboard = lazy(() => import('./pages/WorldDashboard'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Team = lazy(() => import('./pages/Team'));
const ProfilePages = lazy(() => import('./pages/Profile'));
const StarredPage = lazy(() => import('./pages/Starred'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const QuestsPage = lazy(() => import('./pages/Quests'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingState message="Loading..." />}>
        <Routes>
          {/* Your routes here */}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
```

## Step 4: Add Image Optimization

Update `src/services/directus.js`:

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

  // Use proxy path (after security fix) or direct URL
  return `/api/assets/${fileId}?${params}`;
};

// Presets for common use cases
export const assetPresets = {
  thumbnail: { width: 150, height: 150, quality: 70 },
  card: { width: 400, height: 300, quality: 75 },
  hero: { width: 1200, height: 600, quality: 85 },
  avatar: { width: 100, height: 100, quality: 80 }
};
```

## Step 5: Create Environment-Aware Logger

Create `src/utils/logger.js`:

```javascript
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => isDev && console.log('[app]', ...args),
  warn: (...args) => isDev && console.warn('[app]', ...args),
  error: (...args) => console.error('[app]', ...args), // Always log errors
  debug: (...args) => isDev && console.debug('[app]', ...args),
};

export default logger;
```

Then replace `console.log` calls:
```javascript
// Before
console.log('[directus] Fetching world:', id);

// After
import { logger } from '../utils/logger';
logger.log('[directus] Fetching world:', id);
```

## Verification

After applying optimizations:

```bash
# Build and check output
npm run build

# Check bundle stats
open dist/bundle-stats.html

# Verify sizes
ls -la dist/assets/
```

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Initial bundle | ~260KB | <80KB |
| Code splitting | None | Route-based |
| Compression | None | Brotli + gzip |
| Bundle analysis | None | HTML report |
