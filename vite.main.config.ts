import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    // Some libs that can run in both Web and Node.js environments are shipped with dual packages
    // that default to the Web version, this options allows Vite to pick the Node.js version instead
    browserField: false,
    mainFields: ['module', 'jsnext:main', 'jsnext'],
    alias: {
      '@': '/src',
      '@main': '/src/main',
      '@shared': '/src/shared',
    },
  },
  build: {
    rollupOptions: {
      external: ['better-sqlite3'],
    },
  },
});