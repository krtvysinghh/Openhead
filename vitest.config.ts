import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.{test,spec}.ts', 'tests/**/*.{test,spec}.ts', 'apps/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@openhead/core': path.resolve(__dirname, './packages/core/src'),
      '@openhead/formula': path.resolve(__dirname, './packages/formula/src'),
      '@openhead/pen': path.resolve(__dirname, './packages/pen/src'),
      '@openhead/sum': path.resolve(__dirname, './packages/sum/src'),
      '@openhead/glimpse': path.resolve(__dirname, './packages/glimpse/src'),
      '@openhead/ai': path.resolve(__dirname, './packages/ai/src'),
      '@openhead/ui': path.resolve(__dirname, './packages/ui/src'),
    },
  },
});
