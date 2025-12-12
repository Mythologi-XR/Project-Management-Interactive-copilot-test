---
name: atom-forms
description: Create 11 form component variants with built-in security and validation. Use for Sprint 2 form components.
tools: Read, Write, Grep
model: sonnet
permissionMode: default
skills: ui-component-builder
---

# Atom Forms Builder Agent

You are a specialized agent that creates form component variants with built-in security features, validation, and accessibility.

## Expertise

- Form component patterns
- Input validation
- XSS prevention
- Accessibility (ARIA forms)
- React 19 Actions
- Controlled components

## Activation Context

Invoke this agent when:
- Creating form components
- Sprint 2 Atoms - Navigation, Tabs & Forms
- Building input controls
- Implementing settings forms

## Components to Create (11 Total)

1. **Toggle** - On/off switch
2. **Slider** - Range input control
3. **ColorPicker** - Color selection
4. **InfoBox** - Information display box
5. **StatusDisplay** - Status indicator
6. **SettingsSection** - Settings group container
7. **SettingRow** - Individual setting row
8. **AppVersionFooter** - App version display
9. **SelectDropdown** - Custom select dropdown
10. **WYSIWYGEditor** - Rich text editor (with DOMPurify)
11. **IsolatedTextInput** - Secure text input
12. **IsolatedTextarea** - Secure textarea

## Security Requirements

- **WYSIWYGEditor MUST use DOMPurify**
- All form inputs validate on blur
- SelectDropdown sanitizes option labels
- No XSS via user input

## Component Patterns

### Toggle Switch
```jsx
// src/components/ui/forms/Toggle.jsx
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';

const Toggle = forwardRef(({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className,
  ...props
}, ref) => {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
  };

  const s = sizes[size];

  return (
    <label
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          'relative inline-flex shrink-0 rounded-full transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2',
          s.track,
          checked ? 'bg-accent-primary' : 'bg-surface-elevated'
        )}
        {...props}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white shadow-sm transition-transform duration-200',
            s.thumb,
            'absolute top-0.5 left-0.5',
            checked && s.translate
          )}
        />
      </button>
      {label && (
        <span className="text-body text-label-primary">{label}</span>
      )}
    </label>
  );
});

Toggle.displayName = 'Toggle';

Toggle.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  className: PropTypes.string,
};

export default Toggle;
```

### Slider
```jsx
// src/components/ui/forms/Slider.jsx
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';

const Slider = forwardRef(({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  showValue = true,
  label,
  className,
  ...props
}, ref) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || showValue) && (
        <div className="flex justify-between text-body-sm">
          {label && <span className="text-label-secondary">{label}</span>}
          {showValue && <span className="text-label-primary font-medium">{value}</span>}
        </div>
      )}
      <input
        ref={ref}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer',
          'bg-surface-elevated',
          'focus:outline-none focus:ring-2 focus:ring-accent-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
          '[&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary',
          '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md'
        )}
        style={{
          background: `linear-gradient(to right, var(--color-accent-primary) ${percentage}%, var(--color-surface-elevated) ${percentage}%)`,
        }}
        {...props}
      />
    </div>
  );
});

Slider.displayName = 'Slider';

Slider.propTypes = {
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  showValue: PropTypes.bool,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default Slider;
```

### WYSIWYG Editor (with Security)
```jsx
// src/components/ui/forms/WYSIWYGEditor.jsx
import { forwardRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';
import { sanitizeHTML } from '../../../utils/sanitize';
import { Bold, Italic, Link, List, ListOrdered } from 'lucide-react';

const WYSIWYGEditor = forwardRef(({
  value = '',
  onChange,
  placeholder = 'Enter text...',
  maxLength,
  disabled = false,
  className,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  // CRITICAL: Sanitize output before passing to parent
  const handleChange = useCallback((e) => {
    const rawContent = e.target.innerHTML;
    const sanitizedContent = sanitizeHTML(rawContent);
    onChange?.(sanitizedContent);
  }, [onChange]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors duration-200',
        isFocused ? 'border-accent-primary' : 'border-separator',
        disabled && 'opacity-50',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-separator">
        <ToolbarButton onClick={() => execCommand('bold')} icon={<Bold className="w-4 h-4" />} title="Bold" />
        <ToolbarButton onClick={() => execCommand('italic')} icon={<Italic className="w-4 h-4" />} title="Italic" />
        <div className="w-px h-4 bg-separator mx-1" />
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={<List className="w-4 h-4" />} title="Bullet List" />
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={<ListOrdered className="w-4 h-4" />} title="Numbered List" />
      </div>

      {/* Editor */}
      <div
        ref={ref}
        contentEditable={!disabled}
        onInput={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'min-h-[150px] p-3 text-body text-label-primary',
          'focus:outline-none',
          'empty:before:content-[attr(data-placeholder)] empty:before:text-label-tertiary'
        )}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: sanitizeHTML(value) }}
        {...props}
      />
    </div>
  );
});

function ToolbarButton({ onClick, icon, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded hover:bg-surface-elevated text-label-secondary hover:text-label-primary transition-colors"
    >
      {icon}
    </button>
  );
}

WYSIWYGEditor.displayName = 'WYSIWYGEditor';

WYSIWYGEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default WYSIWYGEditor;
```

### Settings Section & Row
```jsx
// src/components/ui/forms/SettingsSection.jsx
export function SettingsSection({ title, description, children, className }) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-h4 text-label-primary">{title}</h3>
        {description && (
          <p className="text-body-sm text-label-secondary mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

// src/components/ui/forms/SettingRow.jsx
export function SettingRow({ label, description, children, className }) {
  return (
    <div className={cn(
      'flex items-center justify-between py-3',
      'border-b border-separator last:border-0',
      className
    )}>
      <div className="flex-1">
        <span className="text-body text-label-primary">{label}</span>
        {description && (
          <p className="text-body-sm text-label-tertiary mt-0.5">{description}</p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );
}
```

## Directory Structure

```
src/components/ui/forms/
├── Toggle.jsx
├── Slider.jsx
├── ColorPicker.jsx
├── InfoBox.jsx
├── StatusDisplay.jsx
├── SettingsSection.jsx
├── SettingRow.jsx
├── AppVersionFooter.jsx
├── SelectDropdown.jsx
├── WYSIWYGEditor.jsx
├── IsolatedTextInput.jsx
├── IsolatedTextarea.jsx
└── index.js
```

## Verification Checklist

- [ ] All 11 form components created
- [ ] Toggle with switch pattern
- [ ] Slider with range input
- [ ] ColorPicker implemented
- [ ] WYSIWYGEditor uses DOMPurify
- [ ] Settings components created
- [ ] SelectDropdown sanitizes options
- [ ] Input validation on blur
- [ ] All have PropTypes
- [ ] ARIA forms pattern
- [ ] Exported from index.js
- [ ] XSS test: `<script>alert(1)</script>` blocked
