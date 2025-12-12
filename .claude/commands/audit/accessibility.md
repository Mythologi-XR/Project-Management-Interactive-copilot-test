---
description: Audit a page or component for accessibility issues
argument-hint: [file-path]
---

Audit accessibility for: **$1**

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/accessibility-audit.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 9)
- WCAG 2.1 Guidelines

## Accessibility Checklist

### 1. Semantic HTML

- [ ] Proper heading hierarchy (h1 > h2 > h3)
- [ ] Use of semantic elements (nav, main, article, section)
- [ ] Buttons vs links used correctly
- [ ] Lists used for list content

### 2. ARIA Attributes

- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs have associated labels
- [ ] Dynamic content has `aria-live` regions
- [ ] Modal dialogs have proper ARIA roles

Search for issues:
```jsx
// Missing aria-label on icon button
<button onClick={...}><Icon /></button>

// Should be:
<button onClick={...} aria-label="Description"><Icon /></button>
```

### 3. Keyboard Navigation

- [ ] All interactive elements focusable
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Escape closes modals
- [ ] Enter/Space activate buttons

### 4. Focus Management

- [ ] Modal traps focus when open
- [ ] Focus returns after modal closes
- [ ] Skip-to-content link present
- [ ] Focus visible on all interactive elements

### 5. Color & Contrast

- [ ] Color not sole indicator of information
- [ ] Text contrast ratio >= 4.5:1 (AA)
- [ ] Large text contrast >= 3:1
- [ ] Focus indicators have sufficient contrast

### 6. Images & Media

- [ ] All images have `alt` text
- [ ] Decorative images have `alt=""`
- [ ] Complex images have detailed descriptions
- [ ] No auto-playing media

### 7. Forms

- [ ] Labels associated with inputs
- [ ] Error messages are accessible
- [ ] Required fields indicated
- [ ] Form validation announced

### 8. Dark Mode

- [ ] All content visible in dark mode
- [ ] Contrast maintained in both modes
- [ ] Focus indicators visible in dark mode

## Common Fixes

### Add aria-label to icon buttons:
```jsx
<button aria-label="Close modal">
  <X className="w-5 h-5" />
</button>
```

### Focus trap for modals:
```jsx
// Use a library like focus-trap-react
import FocusTrap from 'focus-trap-react';

<FocusTrap>
  <Modal>...</Modal>
</FocusTrap>
```

### Skip to content:
```jsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## Output

Provide an accessibility report:

```markdown
## Accessibility Audit: $1

### Issues Found

| Issue | Severity | WCAG | Fix |
|-------|----------|------|-----|
| Missing aria-label | High | 4.1.2 | Add to line X |
| Low contrast text | Medium | 1.4.3 | Change color |

### Recommendations
1. Add aria-labels to X buttons
2. Implement focus trap in modals
3. Add skip-to-content link

### Testing Suggestions
- [ ] Test with VoiceOver/NVDA
- [ ] Navigate with keyboard only
- [ ] Check with Accessibility DevTools
```
