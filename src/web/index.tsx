import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Web版本的全局配置
const webConfig = {
  isElectron: false,
  isWebPreview: true,
  platform: 'web',
  version: __APP_VERSION__ || '1.0.0',
  buildTime: __BUILD_TIME__ || new Date().toISOString(),
};

// 将配置挂载到全局对象
(window as any).__WEATHER_DUCK_CONFIG__ = webConfig;

// 创建React根节点
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// 渲染应用
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 开发环境热更新支持
if (import.meta.hot) {
  import.meta.hot.accept();
}

// Web版本特有的功能
if (typeof window !== 'undefined') {
  // 禁用右键菜单（模拟桌面应用体验）
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  
  // 禁用文本选择（可选）
  document.addEventListener('selectstart', (e) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT' && 
        (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });
  
  // 键盘快捷键支持
  document.addEventListener('keydown', (e) => {
    // F5刷新
    if (e.key === 'F5') {
      e.preventDefault();
      window.location.reload();
    }
    
    // Ctrl+R刷新
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      window.location.reload();
    }
    
    // F11全屏
    if (e.key === 'F11') {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  });
  
  // 性能监控
  if (process.env.NODE_ENV === 'production') {
    // 监控页面加载性能
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('页面加载性能:', {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
      });
    });
  }
}

// 错误边界处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
  // 可以在这里添加错误上报逻辑
});

window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
  // 可以在这里添加错误上报逻辑
});