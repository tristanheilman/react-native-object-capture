# Commit Convention

This document outlines the commit message convention used in this repository. We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Commit Message Format

Each commit message consists of a **header**, a **body**, and a **footer**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

The **header** is mandatory and must conform to the commit message format.

## Types

The following are the types of commits we use:

- `feat`: A new feature
  ```
  feat: add support for cloud point visualization
  feat(ios): implement object detection threshold
  ```

- `fix`: A bug fix
  ```
  fix: resolve camera initialization crash
  fix(android): handle null session state
  ```

- `docs`: Documentation only changes
  ```
  docs: update README with new component props
  docs: add API documentation for PhotogrammetrySession
  ```

- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
  ```
  style: format code according to prettier rules
  style: fix indentation in example code
  ```

- `refactor`: A code change that neither fixes a bug nor adds a feature
  ```
  refactor: extract common camera logic into utility
  refactor(ios): reorganize session management code
  ```

- `perf`: A code change that improves performance
  ```
  perf: optimize point cloud rendering
  perf: reduce memory usage during capture
  ```

- `test`: Adding missing tests or correcting existing tests
  ```
  test: add unit tests for session state changes
  test: fix flaky camera initialization test
  ```

- `build`: Changes that affect the build system or external dependencies
  ```
  build: update React Native to 0.76.0
  build: add new iOS dependency
  ```

- `ci`: Changes to our CI configuration files and scripts
  ```
  ci: add GitHub Actions workflow
  ci: update iOS build configuration
  ```

- `chore`: Other changes that don't modify src or test files
  ```
  chore: update dependencies
  chore: remove unused files
  ```

- `revert`: Reverts a previous commit
  ```
  revert: revert "feat: add cloud point visualization"
  ```

## Scope

The scope is optional and represents the section of the codebase that the commit affects. For example:
- `(ios)`: iOS-specific changes
- `(android)`: Android-specific changes
- `(docs)`: Documentation changes
- `(example)`: Example app changes

## Subject

The subject contains a succinct description of the change:
- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

## Body

The body should include the motivation for the change and contrast this with previous behavior.

## Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

Example:
```
feat: add cloud point visualization

This change adds real-time point cloud visualization during object capture.
The visualization helps users understand the capture progress and quality.

BREAKING CHANGE: ObjectCaptureView now requires additional permissions for
point cloud rendering.

Closes #123
```

## Examples

```
feat: add object detection threshold configuration
fix(ios): resolve camera initialization crash
docs: update README with new component props
style: format code according to prettier rules
refactor: extract common camera logic into utility
perf: optimize point cloud rendering
test: add unit tests for session state changes
build: update React Native to 0.76.0
ci: add GitHub Actions workflow
chore: update dependencies
revert: revert "feat: add cloud point visualization"
``` 