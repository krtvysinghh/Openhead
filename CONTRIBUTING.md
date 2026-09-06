# Contributing to Openhead

Thank you for contributing to Openhead! We welcome bug reports, feature enhancements, documentation updates, and test additions.

## Code of Conduct

All contributors must adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Development Setup

1. Fork and clone the repository.
2. Ensure you have Node.js >= 20 and pnpm installed.
3. Run `pnpm install` to install dependencies.
4. Run `pnpm test` to verify the test suite.

## Engineering Standards

- **Zero-Warning Code**: All packages must pass strict TypeScript checks (`pnpm typecheck`) and linting without errors.
- **Test Coverage**: Every new formula, AST transform, or UI component must include corresponding unit tests in `vitest`.
- **Commit Messages**: Follow Conventional Commits format (`feat(...)`, `fix(...)`, `docs(...)`, `test(...)`).
- **No Proprietary Code**: Do not copy code, assets, or decompiled material from Microsoft Office or other proprietary products.
