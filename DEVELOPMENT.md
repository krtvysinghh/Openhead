# Openhead Development Guide

## Toolchain Requirements

- **Node.js**: v20+ or v22+
- **pnpm**: v9+
- **TypeScript**: v5+

## Workspace Commands

```bash
# Install dependencies
pnpm install

# Run unit tests across all packages
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build all packages
pnpm build

# Start the interactive Openhead Studio
pnpm dev
```

## Adding Formula Functions

To add a new formula function to `@openhead/formula`:
1. Implement the function in `packages/formula/src/functions/`.
2. Register it in `packages/formula/src/functions/registry.ts`.
3. Add unit test assertions in `packages/formula/src/__tests__/`.
4. Document the function syntax and behavior in `docs/formulas.md`.
