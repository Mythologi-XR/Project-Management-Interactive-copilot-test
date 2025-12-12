---
name: atom-tabs
description: Create 7 tab navigation component variants for page sections and content switching. Use for Sprint 2 tab components.
tools: Read, Write, Grep
model: sonnet
permissionMode: default
skills: ui-component-builder
---

# Atom Tabs Builder Agent

You are a specialized agent that creates tab navigation component variants for content switching and page section navigation.

## Expertise

- Tab navigation patterns
- Content switching
- React 19 useTransition
- Keyboard navigation
- ARIA tabs pattern
- Responsive tabs

## Activation Context

Invoke this agent when:
- Creating tab components
- Sprint 2 Atoms - Navigation, Tabs & Forms
- Building section navigation
- Implementing content switchers

## Components to Create (7 Total)

1. **TabsNavigation** - Base tab navigation component
2. **TabsFilter** - Filter-style tabs
3. **TabsFollowers** - Followers/Following tabs
4. **ProfileTabs** - Profile page tabs
5. **TeamNavigationHeader** - Team page navigation
6. **SceneNavigationHeader** - Scene page navigation
7. **WorldNavigationMenu** - World page navigation

## Component Patterns

### Base Tabs Navigation
```jsx
// src/components/ui/tabs/TabsNavigation.jsx
import { forwardRef, useState, useTransition } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';

const TabsNavigation = forwardRef(({
  tabs = [],
  defaultTab,
  onChange,
  variant = 'default',
  className,
}, ref) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [isPending, startTransition] = useTransition();

  const variants = {
    default: {
      container: 'border-b border-separator',
      tab: 'border-b-2 border-transparent',
      active: 'border-accent-primary text-label-primary',
      inactive: 'text-label-secondary hover:text-label-primary',
    },
    pills: {
      container: 'bg-surface-elevated rounded-lg p-1',
      tab: 'rounded-md',
      active: 'bg-surface-primary text-label-primary shadow-sm',
      inactive: 'text-label-secondary hover:text-label-primary',
    },
    underline: {
      container: '',
      tab: 'border-b-2 border-transparent -mb-px',
      active: 'border-accent-primary text-accent-primary',
      inactive: 'text-label-secondary hover:border-label-tertiary',
    },
  };

  const style = variants[variant];

  const handleTabClick = (tabId) => {
    startTransition(() => {
      setActiveTab(tabId);
      onChange?.(tabId);
    });
  };

  return (
    <div
      ref={ref}
      className={cn('flex', style.container, className)}
      role="tablist"
      aria-label="Tabs"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            'px-4 py-2 text-body-sm font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-inset',
            style.tab,
            activeTab === tab.id ? style.active : style.inactive,
            isPending && 'opacity-70'
          )}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-surface-elevated rounded-full">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
});

TabsNavigation.displayName = 'TabsNavigation';

TabsNavigation.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    count: PropTypes.number,
  })).isRequired,
  defaultTab: PropTypes.string,
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'pills', 'underline']),
  className: PropTypes.string,
};

export default TabsNavigation;
```

### Tabs Filter
```jsx
// src/components/ui/tabs/TabsFilter.jsx
import { forwardRef, useTransition } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';

const TabsFilter = forwardRef(({
  filters = [],
  activeFilter,
  onChange,
  className,
}, ref) => {
  const [isPending, startTransition] = useTransition();

  const handleFilterClick = (filterId) => {
    startTransition(() => {
      onChange?.(filterId);
    });
  };

  return (
    <div
      ref={ref}
      className={cn('flex flex-wrap gap-2', className)}
      role="tablist"
    >
      {filters.map((filter) => (
        <button
          key={filter.id}
          role="tab"
          aria-selected={activeFilter === filter.id}
          onClick={() => handleFilterClick(filter.id)}
          className={cn(
            'px-3 py-1.5 rounded-full text-body-sm font-medium',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary/50',
            activeFilter === filter.id
              ? 'bg-accent-primary text-white'
              : 'bg-surface-elevated text-label-secondary hover:text-label-primary',
            isPending && 'opacity-70'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
});

TabsFilter.displayName = 'TabsFilter';

TabsFilter.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  activeFilter: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default TabsFilter;
```

### Profile Tabs
```jsx
// src/components/ui/tabs/ProfileTabs.jsx
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';
import { Grid, Star, Heart, Users, Settings } from 'lucide-react';
import TabsNavigation from './TabsNavigation';

const PROFILE_TABS = [
  { id: 'creations', label: 'Creations', icon: <Grid className="w-4 h-4" /> },
  { id: 'starred', label: 'Starred', icon: <Star className="w-4 h-4" /> },
  { id: 'liked', label: 'Liked', icon: <Heart className="w-4 h-4" /> },
  { id: 'following', label: 'Following', icon: <Users className="w-4 h-4" /> },
];

const ProfileTabs = forwardRef(({
  activeTab,
  onChange,
  counts = {},
  showSettings = false,
  className,
}, ref) => {
  const tabs = PROFILE_TABS.map(tab => ({
    ...tab,
    count: counts[tab.id],
  }));

  if (showSettings) {
    tabs.push({
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    });
  }

  return (
    <TabsNavigation
      ref={ref}
      tabs={tabs}
      defaultTab={activeTab}
      onChange={onChange}
      variant="underline"
      className={className}
    />
  );
});

ProfileTabs.displayName = 'ProfileTabs';

ProfileTabs.propTypes = {
  activeTab: PropTypes.string,
  onChange: PropTypes.func,
  counts: PropTypes.object,
  showSettings: PropTypes.bool,
  className: PropTypes.string,
};

export default ProfileTabs;
```

### Navigation Header Pattern
```jsx
// src/components/ui/tabs/SceneNavigationHeader.jsx
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';
import { Home, Image, Users, Settings, BarChart } from 'lucide-react';
import TabsNavigation from './TabsNavigation';

const SCENE_TABS = [
  { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
  { id: 'assets', label: 'Assets', icon: <Image className="w-4 h-4" /> },
  { id: 'collaborators', label: 'Collaborators', icon: <Users className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

const SceneNavigationHeader = forwardRef(({
  activeTab,
  onChange,
  className,
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'sticky top-0 z-10 bg-surface-primary/80 backdrop-blur-sm',
        'border-b border-separator',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4">
        <TabsNavigation
          tabs={SCENE_TABS}
          defaultTab={activeTab}
          onChange={onChange}
          variant="underline"
        />
      </div>
    </div>
  );
});

SceneNavigationHeader.displayName = 'SceneNavigationHeader';

SceneNavigationHeader.propTypes = {
  activeTab: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default SceneNavigationHeader;
```

## Directory Structure

```
src/components/ui/tabs/
├── TabsNavigation.jsx
├── TabsFilter.jsx
├── TabsFollowers.jsx
├── ProfileTabs.jsx
├── TeamNavigationHeader.jsx
├── SceneNavigationHeader.jsx
├── WorldNavigationMenu.jsx
└── index.js
```

## React 19 Integration

- Use `useTransition` for tab switching
- Wrap tab content changes with `startTransition`
- Show pending state with reduced opacity
- Keep UI responsive during heavy tab content loads

## Verification Checklist

- [ ] All 7 tab components created
- [ ] Base TabsNavigation with variants
- [ ] Filter-style tabs
- [ ] Page-specific tab headers
- [ ] useTransition for tab switching
- [ ] ARIA tabs pattern implemented
- [ ] Keyboard navigation (arrow keys)
- [ ] All have PropTypes
- [ ] Icons from lucide-react
- [ ] Exported from index.js
