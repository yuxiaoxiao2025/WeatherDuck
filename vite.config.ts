import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isWebPreview = mode === 'web-preview';
  
  return {
    plugins: [react()],
    
    // 根据构建模式设置不同的根目录和入口
    root: isWebPreview ? 'src/web' : 'src/renderer',
    
    build: {
      outDir: isWebPreview ? '../../dist-web' : '../../dist/renderer',
      emptyOutDir: true,
      rollupOptions: {
        input: isWebPreview 
          ? resolve(__dirname, 'src/web/index.html')
          : resolve(__dirname, 'src/renderer/index.html'),
      },
      // Web预览版本的特殊配置
      ...(isWebPreview && {
        target: 'es2015',
        minify: 'terser',
        sourcemap: true,
        chunkSizeWarningLimit: 1000,
      }),
    },
    
    // 开发服务器配置
    server: {
      port: 3000,
      host: true,
      strictPort: true,
    },
    
    // 预览服务器配置
    preview: {
      port: 3000,
      host: true,
    },
    
    // 路径解析
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@renderer': resolve(__dirname, 'src/renderer'),
        '@shared': resolve(__dirname, 'src/shared'),
        '@web': resolve(__dirname, 'src/web'),
      },
    },
    
    // 环境变量配置
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __IS_WEB_PREVIEW__: JSON.stringify(isWebPreview),
    },
    
    // CSS配置
    css: {
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
    
    // 优化配置
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'framer-motion',
        'lucide-react',
      ],
      ...(isWebPreview && {
        exclude: ['electron'],
      }),
    },
    
    // Web预览版本的特殊配置
    ...(isWebPreview && {
      base: './',
      publicDir: resolve(__dirname, 'public'),
    }),
  };
});