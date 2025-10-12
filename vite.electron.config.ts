import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Electron渲染进程专用配置
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  root: 'src-electron',
  build: {
    outDir: '../dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src-electron/index.html'),
      external: ['electron']
    },
    target: 'es2020',
    sourcemap: true
  },
  server: {
    port: 3000,
    host: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src'),
      '@electron': resolve(__dirname, 'src-electron'),
      '@electron/main': resolve(__dirname, 'src-electron/main'),
      '@web': resolve(__dirname, 'src-web'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@services': resolve(__dirname, 'src/services'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@components': resolve(__dirname, 'src/components')
    }
  }
})