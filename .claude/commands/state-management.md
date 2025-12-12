---
description: Implement optimistic updates and granular loading states
---

Implement advanced state management patterns.

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/state-management.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 8)

## Overview

This command implements:
1. **Optimistic Updates** - Update UI before server confirms
2. **Granular Loading States** - Track loading per-item, not globally
3. **Form State Management** - Reusable form handling

---

## Task 8.1: Create useOptimisticUpdate Hook

Create `src/hooks/useOptimisticUpdate.js`:

```javascript
import { useState, useCallback } from 'react';

/**
 * Hook for optimistic updates with rollback on failure
 *
 * @param {Function} apiCall - The API function to call
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export function useOptimisticUpdate(apiCall, options = {}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async ({ optimisticData, onOptimistic, onSuccess, onError, onSettled }) => {
      setError(null);
      setPending(true);

      // Apply optimistic update
      let previousData;
      if (onOptimistic) {
        previousData = onOptimistic(optimisticData);
      }

      try {
        const result = await apiCall(optimisticData);
        onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);
        // Rollback on error
        if (previousData !== undefined && onOptimistic) {
          onOptimistic(previousData);
        }
        onError?.(err);
        throw err;
      } finally {
        setPending(false);
        onSettled?.();
      }
    },
    [apiCall]
  );

  return {
    execute,
    pending,
    error,
    clearError: () => setError(null),
  };
}

export default useOptimisticUpdate;
```

### Usage Example

```javascript
import { useOptimisticUpdate } from '../hooks/useOptimisticUpdate';
import { worldAPI } from '../services/directus';

function WorldCard({ world, onUpdate }) {
  const { execute, pending } = useOptimisticUpdate(worldAPI.toggleStar);

  const handleStar = async () => {
    await execute({
      optimisticData: { id: world.id, starred: !world.starred },
      onOptimistic: (data) => {
        const prev = world.starred;
        onUpdate({ ...world, starred: data.starred });
        return prev;
      },
      onSuccess: (result) => {
        onUpdate(result);
      },
      onError: () => {
        // Already rolled back
      },
    });
  };

  return (
    <button onClick={handleStar} disabled={pending}>
      {world.starred ? 'Unstar' : 'Star'}
    </button>
  );
}
```

---

## Task 8.2: Create useLoadingStates Hook

Create `src/hooks/useLoadingStates.js`:

```javascript
import { useState, useCallback } from 'react';

/**
 * Hook for managing granular loading states per item
 *
 * @returns {Object} Loading state management methods
 */
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = useCallback((id, isLoading) => {
    setLoadingStates((prev) => ({
      ...prev,
      [id]: isLoading,
    }));
  }, []);

  const isLoading = useCallback(
    (id) => {
      return loadingStates[id] || false;
    },
    [loadingStates]
  );

  const withLoading = useCallback(
    async (id, asyncFn) => {
      setLoading(id, true);
      try {
        return await asyncFn();
      } finally {
        setLoading(id, false);
      }
    },
    [setLoading]
  );

  const clearAll = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setLoading,
    isLoading,
    withLoading,
    clearAll,
  };
}

export default useLoadingStates;
```

### Usage Example

```javascript
import { useLoadingStates } from '../hooks/useLoadingStates';

function WorldList({ worlds }) {
  const { isLoading, withLoading } = useLoadingStates();

  const handleDelete = async (worldId) => {
    await withLoading(worldId, async () => {
      await worldAPI.delete(worldId);
    });
  };

  return (
    <div>
      {worlds.map((world) => (
        <div key={world.id}>
          <span>{world.name}</span>
          <button
            onClick={() => handleDelete(world.id)}
            disabled={isLoading(world.id)}
          >
            {isLoading(world.id) ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Task 8.3: Create useForm Hook

Create `src/hooks/useForm.js`:

```javascript
import { useState, useCallback } from 'react';

/**
 * Hook for form state management
 *
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Submit handler
 * @param {Object} options - Hook options
 * @returns {Object} Form state and methods
 */
export function useForm(initialValues, onSubmit, options = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when value changes
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      setSubmitting(true);

      try {
        // Run validation if provided
        if (options.validate) {
          const validationErrors = options.validate(values);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
          }
        }

        await onSubmit(values);
        if (options.resetOnSuccess) {
          reset();
        }
      } catch (err) {
        if (options.onError) {
          options.onError(err);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [values, onSubmit, options, reset]
  );

  const getFieldProps = useCallback(
    (name) => ({
      value: values[name] || '',
      onChange: (e) => setValue(name, e.target.value),
      onBlur: () => setFieldTouched(name),
      error: touched[name] ? errors[name] : undefined,
    }),
    [values, errors, touched, setValue, setFieldTouched]
  );

  return {
    values,
    errors,
    touched,
    submitting,
    setValue,
    setFieldError,
    setFieldTouched,
    reset,
    handleSubmit,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
  };
}

export default useForm;
```

### Usage Example

```javascript
import { useForm } from '../hooks/useForm';

function CreateWorldModal({ onClose, onCreate }) {
  const form = useForm(
    { name: '', description: '', tagline: '' },
    async (values) => {
      await onCreate(values);
      onClose();
    },
    {
      validate: (values) => {
        const errors = {};
        if (!values.name) errors.name = 'Name is required';
        if (values.name.length < 3) errors.name = 'Name too short';
        return errors;
      },
      resetOnSuccess: true,
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <Input label="Name" {...form.getFieldProps('name')} />
      <TextArea label="Description" {...form.getFieldProps('description')} />
      <Input label="Tagline" {...form.getFieldProps('tagline')} />

      <Button type="submit" loading={form.submitting} disabled={!form.isValid}>
        Create World
      </Button>
    </form>
  );
}
```

---

## Verification

```bash
npm run lint
npm run build
```

## Success Criteria

- [ ] `useOptimisticUpdate` hook created
- [ ] `useLoadingStates` hook created
- [ ] `useForm` hook created
- [ ] Hooks follow existing patterns in `src/hooks/`
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
