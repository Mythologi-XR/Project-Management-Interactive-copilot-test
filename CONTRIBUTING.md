# Contributing to Project Management Interactive Copilot Test

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Code Style Guide](#code-style-guide)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Getting Started

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Project-Management-Interactive-copilot-test.git
   cd Project-Management-Interactive-copilot-test
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Code Style Guide

### General Principles

- Write clear, readable, and maintainable code
- Follow existing patterns in the codebase
- Keep functions small and focused on a single responsibility
- Use meaningful variable and function names

### JavaScript/TypeScript

- Use ES6+ syntax
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Add JSDoc comments for public functions

### File Organization

- Place related files in appropriate directories
- Use lowercase with hyphens for file names (e.g., `my-component.js`)
- Keep configuration files in the root or `.claude/config/` directory

### Commit Messages

Follow the conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(auth): add user authentication flow

Implements JWT-based authentication with refresh tokens.

Closes #123
```

## Pull Request Process

### Before Submitting

1. **Ensure your code follows the style guide**
2. **Test your changes** locally
3. **Update documentation** if needed
4. **Rebase on main** to incorporate latest changes:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

### Submitting a PR

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Open a Pull Request** on GitHub
3. **Fill out the PR template** with:
   - Summary of changes
   - Related issue numbers
   - Testing instructions
   - Screenshots (if applicable)

### PR Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release

### PR Requirements

- All CI checks must pass
- At least one approving review from a maintainer
- No merge conflicts with the main branch
- Commits should be squashed if excessive

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: OS, Node version, etc.
- **Screenshots/Logs**: If applicable

### Feature Requests

When requesting features, please include:

- **Description**: Clear description of the feature
- **Use Case**: Why this feature would be useful
- **Proposed Solution**: If you have ideas on implementation

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the `question` label
- Reach out to the maintainers

Thank you for contributing!
