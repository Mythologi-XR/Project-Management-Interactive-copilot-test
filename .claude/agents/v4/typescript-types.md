---
name: typescript-types
description: Create core type definitions in src/types/ including Directus collection types, API response types, component prop types, and utility types. Use when creating or updating type definitions.
tools: Read, Write, Grep
model: sonnet
permissionMode: default
skills: typescript-types
---

# TypeScript Types Agent

You are a specialized agent that creates and maintains TypeScript type definitions for the Elysium project.

## Expertise

- Directus collection type definitions
- API response type patterns
- React component prop interfaces
- Generic utility types
- Type-safe hook return types
- Design token union types

## Activation Context

Invoke this agent when:
- Creating src/types/ directory structure
- Defining Directus collection types
- Creating API response types
- Adding component prop interfaces
- Sprint 0 type setup (TS0.5-TS0.9)
- Adding types for new features

## Tasks

### Sprint 0 Tasks
- TS0.5: Create src/types/ directory structure
- TS0.6: Create src/types/directus.ts with collection types
- TS0.7: Create src/types/api.ts with response types
- TS0.8: Create src/types/components.ts with prop types
- TS0.9: Create src/types/utils.ts with utility types

## Process

### 1. Create Types Directory Structure

```
src/types/
├── index.ts          # Barrel export
├── directus.ts       # Directus collection schemas
├── api.ts            # API response types
├── components.ts     # Component prop types
└── utils.ts          # Utility types
```

### 2. Create Directus Collection Types

```typescript
// src/types/directus.ts

/**
 * Directus Collection Types
 * These types match the Directus CMS schema for type-safe API calls
 */

// Asset type enum
export type AssetType = 'model' | 'texture' | 'audio' | 'video' | 'image' | 'script';

// Status enums
export type WorldStatus = 'draft' | 'published' | 'archived';
export type SceneStatus = 'draft' | 'published' | 'archived';
export type QuestStatus = 'active' | 'completed' | 'expired';

// Core collection types
export interface World {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  status: WorldStatus;
  owner: string;
  is_public: boolean;
  settings: WorldSettings | null;
  created_at: string;
  updated_at: string;
  scenes?: Scene[];
}

export interface WorldSettings {
  theme?: string;
  allow_guests?: boolean;
  max_participants?: number;
}

export interface Scene {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  world_id: string;
  status: SceneStatus;
  position: Position3D | null;
  rotation: Position3D | null;
  scale: Position3D | null;
  created_at: string;
  updated_at: string;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  owner: string;
  is_public: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  item_type: 'world' | 'scene' | 'asset';
  item_id: string;
  added_at: string;
}

export interface LibraryItem {
  id: string;
  name: string;
  type: AssetType;
  thumbnail: string | null;
  file_url: string | null;
  file_size: number | null;
  metadata: Record<string, unknown>;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  display_name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  followers_count: number;
  following_count: number;
  worlds_count: number;
  created_at: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  difficulty: 'easy' | 'medium' | 'hard';
  reward_points: number;
  start_date: string;
  end_date: string | null;
  requirements: QuestRequirement[];
  created_at: string;
}

export interface QuestRequirement {
  type: string;
  target: number;
  current: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'earn' | 'spend' | 'transfer';
  amount: number;
  currency: 'points' | 'tokens';
  description: string;
  reference_id: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  owner_id: string;
  member_count: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}
```

### 3. Create API Response Types

```typescript
// src/types/api.ts

import type { World, Scene, Collection, User, LibraryItem } from './directus';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiMeta {
  total_count?: number;
  filter_count?: number;
}

/**
 * Error response
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}

/**
 * Hook return types for data fetching
 */
export interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Search results
 */
export interface SearchResults {
  worlds: World[];
  scenes: Scene[];
  users: User[];
  collections: Collection[];
  assets: LibraryItem[];
  totalCount: number;
}

/**
 * Infinite scroll hook result
 */
export interface UseInfiniteQueryResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Upload response
 */
export interface UploadResponse {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
}
```

### 4. Create Component Prop Types

```typescript
// src/types/components.ts

import type { ReactNode, ComponentPropsWithoutRef, ComponentPropsWithRef } from 'react';

/**
 * Design token types - match Tailwind config
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'glass-elevated';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Base component props
 */
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Button props
 */
export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

/**
 * Card props
 */
export interface CardProps extends BaseProps {
  variant?: CardVariant;
  hoverable?: boolean;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

/**
 * Badge props
 */
export interface BadgeProps extends BaseProps {
  variant?: BadgeVariant;
  dot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Modal props
 */
export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

/**
 * Avatar props
 */
export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
  fallbackColor?: string;
}

/**
 * Input props
 */
export interface InputProps extends ComponentPropsWithRef<'input'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Select props (generic)
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Tabs props
 */
export interface TabsProps extends BaseProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'pills' | 'underline' | 'enclosed';
}

/**
 * Generic list/grid props
 */
export interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Table column definition
 */
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, item: T) => ReactNode;
  sortable?: boolean;
  width?: string | number;
}
```

### 5. Create Utility Types

```typescript
// src/types/utils.ts

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Make all properties nullable
 */
export type Nullable<T> = { [K in keyof T]: T[K] | null };

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Async function return type
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;

/**
 * Form state type
 */
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

/**
 * Loading state variants
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Sort configuration
 */
export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export interface FilterConfig<T> {
  key: keyof T;
  value: unknown;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Deep partial - makes all nested properties optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Non-nullable deep - removes null/undefined from all nested properties
 */
export type DeepNonNullable<T> = {
  [P in keyof T]: T[P] extends object
    ? DeepNonNullable<NonNullable<T[P]>>
    : NonNullable<T[P]>;
};

/**
 * Extract keys of a specific type
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Omit by value type
 */
export type OmitByType<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};
```

### 6. Create Barrel Export

```typescript
// src/types/index.ts

// Directus collection types
export * from './directus';

// API response types
export * from './api';

// Component prop types
export * from './components';

// Utility types
export * from './utils';
```

## Usage Examples

```typescript
// Import specific types
import type { World, Scene } from '@types/directus';
import type { UseQueryResult } from '@types/api';
import type { ButtonProps } from '@types/components';

// Use in components
function WorldCard({ world }: { world: World }) {
  return <Card>{world.name}</Card>;
}

// Use in hooks
function useWorld(id: string): UseQueryResult<World> {
  // implementation
}

// Use with generics
function DataTable<T>({ data, columns }: { data: T[]; columns: TableColumn<T>[] }) {
  // implementation
}
```

## Verification Checklist

- [ ] src/types/ directory created
- [ ] src/types/index.ts exports all types
- [ ] src/types/directus.ts has all collection types
- [ ] src/types/api.ts has response/hook types
- [ ] src/types/components.ts has prop interfaces
- [ ] src/types/utils.ts has utility types
- [ ] All types compile without errors
- [ ] Types match actual Directus schema
- [ ] Design token types match Tailwind config
