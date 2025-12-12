---
description: Fix conflicting build systems (Vite vs react-scripts)
---

Fix the conflicting build system configuration.

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/build-system-fix.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Pre-requisite Phase -1)
- Package.json: @package.json

## Problem

The project has conflicting build systems:
- Both `vite` AND `react-scripts` in dependencies
- Broken build script: `"build": "vite react-scripts build"`
- Test script uses react-scripts (Jest) but project uses Vite

## Steps

### 1. Audit Current Scripts

Check `package.json` for:
```json
{
  "scripts": {
    "dev": "...",
    "build": "vite react-scripts build",  // BROKEN
    "test": "react-scripts test",          // Wrong
    "start": "react-scripts start",        // Wrong
    "eject": "react-scripts eject"         // Unused
  }
}
```

### 2. Remove react-scripts

```bash
npm uninstall react-scripts
```

### 3. Fix Package.json Scripts

Update scripts to:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "echo \"Tests not configured. Run /test:setup to configure.\""
  }
}
```

### 4. Remove CRA Files (if exist)

Check for and remove:
- `src/setupTests.js` (CRA test setup)
- `src/reportWebVitals.js` (CRA web vitals)
- Any other CRA-specific files

### 5. Verify

```bash
npm run build
npm run dev
npm run lint
```

## Expected Results

- Build command works: `npm run build`
- Dev server works: `npm run dev`
- No react-scripts dependency
- Clean package.json scripts

## Success Criteria

- [ ] `react-scripts` removed from package.json
- [ ] Build script is `"vite build"` only
- [ ] Dev script is `"vite"` only
- [ ] `npm run build` exits with code 0
- [ ] `npm run dev` starts Vite dev server
- [ ] No CRA-specific files remain
