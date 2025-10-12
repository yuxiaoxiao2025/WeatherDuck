// 共享库总入口文件

// 类型定义
export * from './types';

// UI组件
export * from './components/ui';

// Hooks
export * from './hooks';

// 工具函数
export * from './utils';

// 版本信息
export const VERSION = '1.0.0';
export const BUILD_TARGET = import.meta.env.VITE_BUILD_TARGET || 'web';