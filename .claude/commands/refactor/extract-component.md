---
description: Extract an inline component from a page to a standalone file
argument-hint: [source-file] [component-name] [target-directory]
---

Extract the component **$2** from **$1** to **$3**

## Steps

1. **Locate Component**
   - Read @src/pages/$1 or @src/components/$1
   - Find the component named `$2`
   - Identify all its dependencies (imports, props, context)

2. **Determine Target Location**
   - If shared across pages → `src/components/shared/$3/`
   - If page-specific → `src/components/$3/`
   - If UI primitive → `src/components/ui/`

3. **Extract Component**
   - Create new file with proper imports
   - Define PropTypes or TypeScript interface
   - Export the component

4. **Update Source**
   - Replace inline component with import
   - Pass required props
   - Remove unused imports from source

5. **Update Barrel Exports**
   - Add to appropriate `index.js` file

6. **Verify**
   - Run `npm run lint`
   - Check no broken imports

## Project Standards (@CLAUDE.md)

- Use design tokens for colors/spacing
- Support dark mode
- Use existing UI components where possible
