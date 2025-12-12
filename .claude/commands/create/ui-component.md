---
description: Create a new UI component following the design system
argument-hint: [component-name]
---

Create a new UI component: **$1**

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/ui-component-builder.md

## Reference

- Design System: @CLAUDE.md (UI Components section)
- Existing Components: @src/components/ui/index.js

## Component Template

Create `src/components/ui/$1.jsx`:

```jsx
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn'; // or use clsx if available

const $1 = forwardRef(({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}, ref) => {
  const variants = {
    default: 'bg-surface-elevated text-label-primary',
    // Add more variants
  };

  const sizes = {
    sm: 'text-body-sm px-2 py-1',
    md: 'text-body px-3 py-2',
    lg: 'text-body-lg px-4 py-3',
  };

  return (
    <div
      ref={ref}
      className={cn(
        // Base styles
        'rounded-lg transition-default',
        // Variant styles
        variants[variant],
        // Size styles
        sizes[size],
        // Custom classes
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

$1.displayName = '$1';

$1.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  children: PropTypes.node,
};

export default $1;
```

## Requirements

1. **Design Tokens** - Use tokens from @CLAUDE.md:
   - Colors: `bg-surface-*`, `text-label-*`, `border-separator`
   - Shadows: `shadow-elevation-*`
   - Typography: `text-body`, `text-body-sm`, etc.

2. **Dark Mode** - CSS variables auto-switch, or use `dark:` prefix

3. **Variants** - Support common variants (default, primary, secondary, etc.)

4. **Sizes** - Support sm, md, lg where appropriate

5. **Accessibility** - Add ARIA attributes where needed

6. **Export** - Add to `src/components/ui/index.js`

## After Creation

1. Add export to `src/components/ui/index.js`
2. Run `npm run lint`
3. Document usage in component file or CLAUDE.md if widely used
