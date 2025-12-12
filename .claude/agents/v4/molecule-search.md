---
name: molecule-search
description: Create 13 search and filter components with XSS protection. Use for Sprint 4 molecules.
tools: Read, Write, Grep
model: sonnet
permissionMode: default
skills: shared-component-builder
---

# Molecule Search Builder Agent

You are a specialized agent that creates search and filter components with built-in XSS protection and React 19 transitions.

## Expertise

- Search input patterns
- Filter dropdowns
- XSS prevention
- Debounced search
- React 19 useTransition
- Accessible filtering

## Activation Context

Invoke this agent when:
- Creating search components
- Sprint 4 Molecules - Search & Filters
- Building filter dropdowns
- Implementing sort controls

## Security Requirements

- Search queries sanitized before API call
- No direct string interpolation
- Results sanitized before display
- XSS test: verify `<script>alert(1)</script>` doesn't execute

## Components to Create (13 Total)

### Search Components
1. **SearchSimple** - Basic search input
2. **SearchFull** - Full-featured search with filters
3. **SearchInput** - Styled search input field

### Filter Components
4. **SimpleFilter** - Basic filter dropdown
5. **FilterDropdown** - Multi-option filter
6. **FilterButton** - Filter toggle button
7. **FilterChips** - Selected filter chips

### Sort Components
8. **SortDropdown** - Sort options dropdown
9. **SortButton** - Sort toggle button

### View Controls
10. **ToggleViewMode** - Grid/List toggle
11. **StatusDropdown** - Status filter
12. **VisibilityDropdown** - Visibility filter

## Component Patterns

### Search Input with Security
```jsx
// src/components/shared/search/SearchInput.jsx
import { forwardRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';
import { sanitizeText } from '../../../utils/sanitize';
import { Search, X } from 'lucide-react';
import { useDebouncedCallback } from '../../../hooks/useDebounce';

const SearchInput = forwardRef(({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(value);

  // Debounced search callback
  const debouncedSearch = useDebouncedCallback((searchValue) => {
    // CRITICAL: Sanitize before API call
    const sanitizedValue = sanitizeText(searchValue);
    onSearch?.(sanitizedValue);
  }, debounceMs);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
    debouncedSearch(newValue);
  }, [onChange, debouncedSearch]);

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange?.('');
    onSearch?.('');
  }, [onChange, onSearch]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-label-tertiary" />

      <input
        ref={ref}
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full h-10 pl-10 pr-10 rounded-lg',
          'bg-surface-elevated border border-separator',
          'text-body text-label-primary placeholder:text-label-tertiary',
          'focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary',
          'transition-colors duration-200'
        )}
        {...props}
      />

      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-surface-primary transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4 text-label-tertiary" />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  debounceMs: PropTypes.number,
  className: PropTypes.string,
};

export default SearchInput;
```

### Full Search with Filters
```jsx
// src/components/shared/search/SearchFull.jsx
import { forwardRef, useTransition } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';
import SearchInput from './SearchInput';
import FilterDropdown from './FilterDropdown';
import SortDropdown from './SortDropdown';
import ToggleViewMode from './ToggleViewMode';

const SearchFull = forwardRef(({
  onSearch,
  filters = [],
  activeFilters = {},
  onFilterChange,
  sortOptions = [],
  activeSort,
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  className,
}, ref) => {
  const [isPending, startTransition] = useTransition();

  const handleSearch = (query) => {
    startTransition(() => {
      onSearch?.(query);
    });
  };

  const handleFilterChange = (filterId, value) => {
    startTransition(() => {
      onFilterChange?.(filterId, value);
    });
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col sm:flex-row gap-3',
        isPending && 'opacity-70',
        className
      )}
    >
      <SearchInput
        onSearch={handleSearch}
        className="flex-1"
      />

      <div className="flex gap-2">
        {filters.map((filter) => (
          <FilterDropdown
            key={filter.id}
            label={filter.label}
            options={filter.options}
            value={activeFilters[filter.id]}
            onChange={(value) => handleFilterChange(filter.id, value)}
          />
        ))}

        {sortOptions.length > 0 && (
          <SortDropdown
            options={sortOptions}
            value={activeSort}
            onChange={(value) => {
              startTransition(() => {
                onSortChange?.(value);
              });
            }}
          />
        )}

        {onViewModeChange && (
          <ToggleViewMode
            mode={viewMode}
            onChange={onViewModeChange}
          />
        )}
      </div>
    </div>
  );
});

SearchFull.displayName = 'SearchFull';

export default SearchFull;
```

### Filter Dropdown
```jsx
// src/components/shared/search/FilterDropdown.jsx
import { forwardRef, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';
import { sanitizeText } from '../../../utils/sanitize';
import { ChevronDown, Check } from 'lucide-react';

const FilterDropdown = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  multiple = false,
  className,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (multiple) {
      const values = Array.isArray(value) ? value : [];
      const newValues = values.includes(optionValue)
        ? values.filter(v => v !== optionValue)
        : [...values, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  const isSelected = (optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 h-10 rounded-lg',
          'bg-surface-elevated border border-separator',
          'text-body-sm text-label-primary',
          'hover:bg-surface-primary transition-colors',
          isOpen && 'ring-2 ring-accent-primary/50'
        )}
      >
        <span>{label}</span>
        <ChevronDown className={cn(
          'w-4 h-4 text-label-tertiary transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[160px] py-1 rounded-lg bg-surface-elevated border border-separator shadow-elevation-2 z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2',
                'text-body-sm text-left',
                'hover:bg-surface-primary transition-colors',
                isSelected(option.value) && 'text-accent-primary'
              )}
            >
              {/* SANITIZE option labels */}
              <span>{sanitizeText(option.label)}</span>
              {isSelected(option.value) && (
                <Check className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

FilterDropdown.displayName = 'FilterDropdown';

FilterDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
  className: PropTypes.string,
};

export default FilterDropdown;
```

### Filter Chips
```jsx
// src/components/shared/search/FilterChips.jsx
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';
import { sanitizeText } from '../../../utils/sanitize';
import { X } from 'lucide-react';

const FilterChips = forwardRef(({
  filters = [],
  onRemove,
  onClearAll,
  className,
}, ref) => {
  if (filters.length === 0) return null;

  return (
    <div
      ref={ref}
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {filters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-body-sm"
        >
          {/* SANITIZE filter labels */}
          {sanitizeText(filter.label)}
          <button
            type="button"
            onClick={() => onRemove?.(filter.id)}
            className="p-0.5 rounded-full hover:bg-accent-primary/20 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {filters.length > 1 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-body-sm text-label-secondary hover:text-label-primary transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
});

FilterChips.displayName = 'FilterChips';

export default FilterChips;
```

## Directory Structure

```
src/components/shared/search/
├── SearchSimple.jsx
├── SearchFull.jsx
├── SearchInput.jsx
├── SimpleFilter.jsx
├── FilterDropdown.jsx
├── FilterButton.jsx
├── FilterChips.jsx
├── SortDropdown.jsx
├── SortButton.jsx
├── ToggleViewMode.jsx
├── StatusDropdown.jsx
├── VisibilityDropdown.jsx
└── index.js
```

## Verification Checklist

- [ ] All 13 search/filter components created
- [ ] Search queries sanitized with sanitizeText
- [ ] Filter labels sanitized
- [ ] useTransition for search results
- [ ] Debounced search input
- [ ] Dropdown outside click close
- [ ] Filter chips with remove
- [ ] Sort dropdown working
- [ ] View mode toggle
- [ ] XSS test passes
- [ ] No race conditions
- [ ] Exported from index.js
