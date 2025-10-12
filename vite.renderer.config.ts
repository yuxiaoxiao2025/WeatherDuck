import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@renderer': '/src/renderer',
      '@shared': '/src/shared',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main_window: 'src/renderer/index.html',
      },
    },
  },
});