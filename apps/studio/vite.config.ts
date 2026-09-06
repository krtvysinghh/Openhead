import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@openhead/core': path.resolve(__dirname, '../../packages/core/src'),
      '@openhead/formula': path.resolve(__dirname, '../../packages/formula/src'),
      '@openhead/pen': path.resolve(__dirname, '../../packages/pen/src'),
      '@openhead/sum': path.resolve(__dirname, '../../packages/sum/src'),
      '@openhead/glimpse': path.resolve(__dirname, '../../packages/glimpse/src'),
      '@openhead/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
