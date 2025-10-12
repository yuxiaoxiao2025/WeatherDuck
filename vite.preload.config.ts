import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['electron'],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/src/shared',
    },
  },
});