---
description: Find and merge duplicate code patterns across the codebase
---

Identify and merge duplicate code patterns.

## Skill Reference

For detailed implementation guidance, see the skill files:
- @.claude/skills/v4/code-deduplication/SKILL.md
- @.claude/skills/v4/code-deduplication/API-DEDUP.md
- @.claude/skills/v4/code-deduplication/COMPONENT-DEDUP.md
- @.claude/skills/v4/code-deduplication/UTILITY-DEDUP.md

## Reference

- Architecture Plan: @docs/site-refactor/ARCHITECTURE-OPTIMIZATION-PLAN_v4.md

## Overview

This command helps identify and consolidate:
1. Duplicate API methods
2. Similar components that can be merged
3. Repeated utility functions
4. Redundant configuration

---

## Task 1: Merge Duplicate uploadFile Methods

### Problem

Multiple `uploadFile` implementations exist in `src/services/directus.ts`.

### Search

```bash
grep -n "uploadFile" src/services/directus.ts
grep -n "async.*upload" src/services/directus.ts
```

### Solution

Consolidate into a single typed `uploadFile` function:

```typescript
// src/services/directus.ts

interface UploadOptions {
  folder?: string;
  title?: string;
  onProgress?: (progress: number) => void;
}

interface UploadedFile {
  id: string;
  filename_download: string;
  type: string;
  filesize: number;
}

/**
 * Upload a file to Directus
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);

  if (options.folder) {
    formData.append('folder', options.folder);
  }
  if (options.title) {
    formData.append('title', options.title);
  }

  const response = await fetch(`${directusUrl}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}
```

---

## Task 2: Consolidate Modal Components

### Problem

`WorldModal` and `SceneModal` share similar structure.

### Solution

Create a generic `ContentModal.tsx`:

```typescript
// src/components/shared/modals/ContentModal.tsx
import type { ReactNode, FormEvent } from 'react';
import { Modal, Input, TextArea, Button } from '../../ui';

interface Field {
  name: string;
  label: string;
  type?: 'text' | 'textarea';
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

interface ContentModalProps<T extends Record<string, string>> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  values: T;
  onChange: (name: keyof T, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  submitLabel?: string;
  loading?: boolean;
}

export function ContentModal<T extends Record<string, string>>({
  isOpen,
  onClose,
  title,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel = 'Save',
  loading = false,
}: ContentModalProps<T>): ReactNode {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={onSubmit} className="space-y-4">
        {fields.map((field) => {
          const Component = field.type === 'textarea' ? TextArea : Input;
          return (
            <Component
              key={field.name}
              label={field.label}
              placeholder={field.placeholder}
              value={values[field.name as keyof T] || ''}
              onChange={(e) => onChange(field.name as keyof T, e.target.value)}
              required={field.required}
              rows={field.rows}
            />
          );
        })}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

### Usage

```typescript
// Instead of separate WorldModal and SceneModal:
interface WorldForm {
  name: string;
  description: string;
  tagline: string;
}

const worldFields: Field[] = [
  { name: 'name', label: 'World Name', required: true },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
  { name: 'tagline', label: 'Tagline', placeholder: 'A short tagline...' },
];

<ContentModal<WorldForm>
  isOpen={showWorldModal}
  onClose={() => setShowWorldModal(false)}
  title="Create World"
  fields={worldFields}
  values={worldForm}
  onChange={(name, value) => setWorldForm({ ...worldForm, [name]: value })}
  onSubmit={handleCreateWorld}
/>
```

---

## Task 3: Find Other Duplicates

### Search Commands

```bash
# Find similar function names
grep -rn "const format" src/ --include="*.ts" --include="*.tsx"
grep -rn "function format" src/ --include="*.ts" --include="*.tsx"

# Find duplicate API calls
grep -rn "readItems" src/pages/ --include="*.tsx"
grep -rn "createItem" src/pages/ --include="*.tsx"

# Find similar component patterns
grep -rn "useState.*loading" src/pages/ --include="*.tsx"
grep -rn "useEffect.*fetch" src/pages/ --include="*.tsx"
```

### Common Patterns to Consolidate

| Pattern | Location | Solution |
|---------|----------|----------|
| Loading states | Multiple hooks | Create `useAsyncState` hook |
| Error handling | Multiple components | Use ErrorBoundary |
| Fetch + cache | Multiple hooks | Use RequestCache service |
| Form state | Multiple modals | Use `useForm` hook |

---

## Task 4: Remove Unused Code

### Search Commands

```bash
# Find unused exports (requires TypeScript)
npx ts-unused-exports tsconfig.json

# Find unused dependencies
npx depcheck

# Find dead code markers
grep -rn "// TODO" src/ --include="*.ts" --include="*.tsx"
grep -rn "// FIXME" src/ --include="*.ts" --include="*.tsx"
```

---

## Quick Audit Report

```bash
echo "=== Duplicate Upload Implementations ==="
grep -rn "FormData\|uploadFile" src/pages/ --include="*.tsx" | wc -l

echo "=== Duplicate Modal Patterns ==="
grep -rn "isOpen.*onClose" src/pages/ --include="*.tsx" | wc -l

echo "=== Duplicate Formatters ==="
grep -rn "toLocaleString\|formatDate" src/pages/ --include="*.tsx" | wc -l
```

---

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Success Criteria

- [ ] Duplicate `uploadFile` methods consolidated
- [ ] WorldModal/SceneModal merged into ContentModal
- [ ] No duplicate utility functions
- [ ] Unused code removed
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
