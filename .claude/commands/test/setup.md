---
description: Set up testing infrastructure for the project
---

Set up testing infrastructure for ELYSIUM web app.

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/test-framework-setup.md

## Reference

- Architecture Plan: @docs/ARCHITECTURE-OPTIMIZATION-PLAN_v1.md (Phase 11)

## Installation

Install testing dependencies:

```bash
# Core testing framework (Vitest for Vite projects)
npm install -D vitest @vitest/coverage-v8 jsdom

# React Testing Library
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Accessibility testing
npm install -D jest-axe

# E2E testing (choose one)
npm install -D playwright @playwright/test
# OR
npm install -D cypress
```

## Configuration

### 1. Vitest Config

Create `vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/data/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      }
    }
  }
});
```

### 2. Test Setup File

Create `src/test/setup.js`:

```javascript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
window.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
window.ResizeObserver = MockResizeObserver;
```

### 3. Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

### 4. Playwright Config (E2E)

Create `playwright.config.js`:

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Directory Structure

```
src/
├── test/
│   ├── setup.js           # Test setup
│   ├── utils.jsx          # Test utilities
│   └── mocks/             # Mock data
├── components/
│   └── ui/
│       ├── Button.jsx
│       └── Button.test.jsx  # Co-located tests
├── utils/
│   ├── formatters.js
│   └── formatters.test.js
e2e/
├── world-discovery.spec.js
├── profile.spec.js
└── fixtures/
```

## Example Tests

### Unit Test (Utility)

```javascript
// src/utils/formatters.test.js
import { describe, it, expect } from 'vitest';
import { formatNumber, formatFileSize } from './formatters';

describe('formatNumber', () => {
  it('formats thousands with K suffix', () => {
    expect(formatNumber(1500)).toBe('1.5K');
  });

  it('formats millions with M suffix', () => {
    expect(formatNumber(2500000)).toBe('2.5M');
  });
});
```

### Component Test

```javascript
// src/components/ui/Button.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### E2E Test

```javascript
// e2e/world-discovery.spec.js
import { test, expect } from '@playwright/test';

test('can browse worlds', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /discover/i })).toBeVisible();
  // More assertions...
});
```

## Verification

After setup:
```bash
npm run test:run
npm run test:coverage
```
