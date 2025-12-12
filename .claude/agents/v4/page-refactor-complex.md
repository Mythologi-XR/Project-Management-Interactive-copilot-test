---
name: page-refactor-complex
description: Refactor Library, Team, and Profile pages for reduced complexity. Use for Sprint 12.
tools: Read, Edit, Write, Grep
model: sonnet
permissionMode: default
skills: domain-refactor-library, domain-refactor-team, domain-refactor-profile, domain-refactor-misc, domain-refactor-wallet
---

# Page Refactor Complex Agent

You are a specialized agent that refactors the most complex pages (Library, Team, Profile) to reduce line count, extract reusable components, and improve maintainability.

## Expertise

- Large page decomposition
- Component extraction
- Mock data externalization
- Custom hooks creation
- State management patterns
- Modal extraction

## Activation Context

Invoke this agent when:
- Refactoring complex pages
- Sprint 12 Page Assembly - Complex Pages
- Reducing page line count
- Extracting settings components

## Target Metrics

- Library: 2,853 → <400 lines
- Team: 3,593 → <400 lines
- Profile: 3,945 → <500 lines

## Pages to Refactor

### Library Page (2,853 → 400 lines)
- Extract inline components
- Move mock data to constants
- Create useLibrary hook
- Extract filter/sort logic

### Team Page (3,593 → 400 lines)
- Extract settings components
- Create useTeam hook
- Extract tab content
- Move mock data out

### Profile Page (3,945 → 500 lines)
- Extract tab content
- Extract modals to separate files
- Create useProfile hook
- Extract edit functionality

## Refactoring Process

### Phase 1: Analysis
```bash
# Count current lines
wc -l src/pages/Library.jsx
wc -l src/pages/Team.jsx
wc -l src/pages/Profile.jsx

# Find inline components
grep -n "function [A-Z]" src/pages/Library.jsx
grep -n "const [A-Z].*= (" src/pages/Library.jsx

# Find mock data
grep -n "const.*\[" src/pages/Library.jsx | head -20
```

### Phase 2: Library Page Refactor

#### Extract Custom Hook
```jsx
// src/hooks/useLibrary.js
import { useState, useMemo, useCallback, useDeferredValue } from 'react';
import { useAbortController } from './useAbortController';
import { api } from '../services/api';

export function useLibrary() {
  const { getSignal } = useAbortController();

  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);

  // Deferred search for performance
  const deferredSearch = useDeferredValue(searchQuery);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply filter
    if (filter !== 'all') {
      result = result.filter(item => item.type === filter);
    }

    // Apply search
    if (deferredSearch) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(deferredSearch.toLowerCase())
      );
    }

    // Apply sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

    return result;
  }, [items, filter, deferredSearch, sortBy]);

  // Fetch items
  const fetchItems = useCallback(async () => {
    const signal = getSignal();
    setLoading(true);

    try {
      const data = await api.getLibraryItems({ signal });
      if (!signal.aborted) {
        setItems(data);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [getSignal]);

  // Selection handlers
  const toggleSelection = useCallback((id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(filteredItems.map(item => item.id));
  }, [filteredItems]);

  return {
    items: filteredItems,
    loading,
    error,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    selectedItems,
    toggleSelection,
    clearSelection,
    selectAll,
    refetch: fetchItems,
  };
}
```

#### Refactored Library Page
```jsx
// src/pages/Library.jsx
import { lazy, Suspense, useEffect } from 'react';
import { useLibrary } from '../hooks/useLibrary';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PageLoadingFallback } from '../components/ui/LoadingFallback';
import { SearchFull } from '../components/shared/search/SearchFull';
import { SelectionBar } from '../components/shared/panels/SelectionBar';

const LibraryGrid = lazy(() => import('../components/features/library/LibraryGrid'));
const LibraryList = lazy(() => import('../components/features/library/LibraryList'));

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'model', label: '3D Models' },
  { value: 'audio', label: 'Audio' },
];

const SORT_OPTIONS = [
  { value: 'date', label: 'Date Modified' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
];

export default function Library() {
  const {
    items,
    loading,
    error,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    selectedItems,
    toggleSelection,
    clearSelection,
    refetch,
  } = useLibrary();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) return <ErrorFallback error={error} />;

  const ViewComponent = viewMode === 'grid' ? LibraryGrid : LibraryList;

  return (
    <div className="min-h-screen bg-surface-primary p-6">
      <header className="mb-6">
        <h1 className="text-h2 font-bold text-label-primary">Library</h1>
        <p className="text-body text-label-secondary mt-1">
          Manage your assets and collections
        </p>
      </header>

      <SearchFull
        onSearch={setSearchQuery}
        filters={[{ id: 'type', label: 'Type', options: FILTER_OPTIONS }]}
        activeFilters={{ type: filter }}
        onFilterChange={(id, value) => setFilter(value)}
        sortOptions={SORT_OPTIONS}
        activeSort={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        className="mb-6"
      />

      <ErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
          <ViewComponent
            items={items}
            loading={loading}
            selectedItems={selectedItems}
            onSelect={toggleSelection}
          />
        </Suspense>
      </ErrorBoundary>

      <SelectionBar
        selectedCount={selectedItems.length}
        onClear={clearSelection}
        onDelete={() => {/* Handle delete */}}
        onDownload={() => {/* Handle download */}}
      />
    </div>
  );
}
```

### Phase 3: Team Page Refactor

```jsx
// src/hooks/useTeam.js
// Similar pattern to useLibrary

// src/pages/Team.jsx - Refactored to <400 lines
import { lazy, Suspense } from 'react';
import { useTeam } from '../hooks/useTeam';
import { TeamNavigationHeader } from '../components/ui/tabs/TeamNavigationHeader';

const TeamOverviewTab = lazy(() => import('../components/features/team/TeamOverviewTab'));
const TeamMembersTab = lazy(() => import('../components/features/team/TeamMembersTab'));
const TeamProjectsTab = lazy(() => import('../components/features/team/TeamProjectsTab'));
const TeamSettingsTab = lazy(() => import('../components/features/team/TeamSettingsTab'));

// ... similar structure to Library
```

### Phase 4: Profile Page Refactor

```jsx
// src/hooks/useProfile.js
// Similar pattern with profile-specific logic

// src/pages/Profile.jsx - Refactored to <500 lines
import { lazy, Suspense } from 'react';
import { useProfile } from '../hooks/useProfile';
import { ProfileTabs } from '../components/ui/tabs/ProfileTabs';
import { ProfileHeader } from '../components/features/profile/ProfileHeader';

const ProfileCreationsTab = lazy(() => import('../components/features/profile/ProfileCreationsTab'));
const ProfileStarredTab = lazy(() => import('../components/features/profile/ProfileStarredTab'));
const ProfileLikedTab = lazy(() => import('../components/features/profile/ProfileLikedTab'));
const ProfileFollowingTab = lazy(() => import('../components/features/profile/ProfileFollowingTab'));
const ProfileSettingsTab = lazy(() => import('../components/features/profile/ProfileSettingsTab'));

// ... similar structure
```

## File Structure After Refactor

```
src/
├── pages/
│   ├── Library.jsx           # <400 lines
│   ├── Team.jsx              # <400 lines
│   └── Profile.jsx           # <500 lines
├── hooks/
│   ├── useLibrary.js
│   ├── useTeam.js
│   └── useProfile.js
├── constants/
│   └── mockData.js           # Moved mock data here
└── components/features/
    ├── library/
    │   ├── LibraryGrid.jsx
    │   ├── LibraryList.jsx
    │   ├── LibraryFilters.jsx
    │   └── index.js
    ├── team/
    │   ├── TeamOverviewTab.jsx
    │   ├── TeamMembersTab.jsx
    │   ├── TeamProjectsTab.jsx
    │   ├── TeamSettingsTab.jsx
    │   └── index.js
    └── profile/
        ├── ProfileHeader.jsx
        ├── ProfileCreationsTab.jsx
        ├── ProfileStarredTab.jsx
        ├── ProfileLikedTab.jsx
        ├── ProfileFollowingTab.jsx
        ├── ProfileSettingsTab.jsx
        ├── ProfileEditModal.jsx
        └── index.js
```

## Verification Checklist

- [ ] Library <400 lines
- [ ] Team <400 lines
- [ ] Profile <500 lines
- [ ] useLibrary hook created
- [ ] useTeam hook created
- [ ] useProfile hook created
- [ ] Mock data moved to constants
- [ ] Tab components extracted
- [ ] Modals extracted to separate files
- [ ] Settings components extracted
- [ ] Lazy loading implemented
- [ ] All functionality preserved
- [ ] Full regression testing passes
