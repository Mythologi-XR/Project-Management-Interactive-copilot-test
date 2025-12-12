---
description: Set up TypeScript and perform gradual migration
---

Set up TypeScript and begin gradual migration.

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/typescript-migration.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 10)

## Overview

The project currently uses JavaScript with some `@types/*` packages for IDE hints.
This command sets up TypeScript for gradual migration.

---

## Step 1: Install TypeScript

```bash
npm install -D typescript @types/react @types/react-dom
```

---

## Step 2: Create tsconfig.json

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting - start relaxed, tighten over time */
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,

    /* Allow JS files during migration */
    "allowJs": true,
    "checkJs": false,

    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Step 3: Update Vite Config

Update `vite.config.js` (or rename to `vite.config.ts`):

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Step 4: Create Type Definitions

### Create src/types/index.ts

```typescript
// src/types/index.ts

// Common types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  date_created: string;
}

export interface World {
  id: string;
  name: string;
  description?: string;
  tagline?: string;
  cover_image?: string;
  status: 'draft' | 'published' | 'archived';
  owner: string | User;
  scene_count?: number;
  view_count?: number;
  date_created: string;
  date_updated?: string;
}

export interface Scene {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  world: string | World;
  status: 'draft' | 'published';
  date_created: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  cover_image?: string;
  item_count?: number;
  owner: string | User;
}

export interface LibraryItem {
  id: string;
  name: string;
  type: string;
  thumbnail?: string;
  size?: number;
  date_created: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total_count: number;
    filter_count: number;
  };
}

// Hook return types
export interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

### Create src/types/components.ts

```typescript
// src/types/components.ts

import { ReactNode, ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
  footer?: ReactNode;
}

export interface CardProps {
  variant?: 'default' | 'elevated' | 'glass' | 'glass-elevated';
  hoverable?: boolean;
  className?: string;
  children: ReactNode;
}
```

---

## Step 5: Migration Order

Migrate files in this order (least dependencies first):

### Phase 1: Utilities (`.ts`)
```
src/utils/formatters.js → src/utils/formatters.ts
src/utils/validators.js → src/utils/validators.ts
```

### Phase 2: Services (`.ts`)
```
src/services/directus.js → src/services/directus.ts
src/services/requestCache.js → src/services/requestCache.ts
```

### Phase 3: Hooks (`.ts`)
```
src/hooks/useWorld.js → src/hooks/useWorld.ts
src/hooks/useScene.js → src/hooks/useScene.ts
```

### Phase 4: UI Components (`.tsx`)
```
src/components/ui/Button.jsx → src/components/ui/Button.tsx
src/components/ui/Card.jsx → src/components/ui/Card.tsx
```

### Phase 5: Pages (`.tsx`) - Last
```
src/pages/WorldDiscovery.jsx → src/pages/WorldDiscovery.tsx
```

---

## Step 6: Example Migration

### Before (formatters.js)

```javascript
export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return String(num);
}
```

### After (formatters.ts)

```typescript
export function formatCompactNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return String(num);
}
```

---

## Step 7: Update Package Scripts

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "dev": "vite",
    "build": "tsc --noEmit && vite build"
  }
}
```

---

## Verification

```bash
npm run type-check
npm run build
```

## Success Criteria

- [ ] TypeScript installed
- [ ] tsconfig.json created
- [ ] Type definitions created
- [ ] At least one utility file migrated
- [ ] `npm run type-check` passes (with `--noEmit`)
- [ ] `npm run build` succeeds
