import { contextBridge, ipcRenderer } from 'electron';

// 类型定义
interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  buttons?: string[];
  defaultId?: number;
  title?: string;
  message: string;
  detail?: string;
  checkboxLabel?: string;
  checkboxChecked?: boolean;
  icon?: string;
  cancelId?: number;
  noLink?: boolean;
  normalizeAccessKeys?: boolean;
}

interface MessageBoxResult {
  response: number;
  checkboxChecked?: boolean;
}

// 安全验证函数
function validateString(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('Expected string value');
  }
  if (value.length > 1000) {
    throw new Error('String too long');
  }
  return value;
}

function validateNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Expected finite number');
  }
  return value;
}

function validateBounds(bounds: unknown): WindowBounds {
  if (typeof bounds !== 'object' || bounds === null) {
    throw new Error('Expected bounds object');
  }
  
  const b = bounds as Record<string, unknown>;
  return {
    x: validateNumber(b.x),
    y: validateNumber(b.y),
    width: validateNumber(b.width),
    height: validateNumber(b.height),
  };
}

function validateMessageBoxOptions(options: unknown): MessageBoxOptions {
  if (typeof options !== 'object' || options === null) {
    throw new Error('Expected options object');
  }
  
  const opts = options as Record<string, unknown>;
  
  if (typeof opts.message !== 'string') {
    throw new Error('Message is required and must be a string');
  }
  
  return {
    type: opts.type as MessageBoxOptions['type'],
    buttons: Array.isArray(opts.buttons) ? opts.buttons.map(validateString) : undefined,
    defaultId: opts.defaultId !== undefined ? validateNumber(opts.defaultId) : undefined,
    title: opts.title !== undefined ? validateString(opts.title) : undefined,
    message: validateString(opts.message),
    detail: opts.detail !== undefined ? validateString(opts.detail) : undefined,
    checkboxLabel: opts.checkboxLabel !== undefined ? validateString(opts.checkboxLabel) : undefined,
    checkboxChecked: typeof opts.checkboxChecked === 'boolean' ? opts.checkboxChecked : undefined,
    icon: opts.icon !== undefined ? validateString(opts.icon) : undefined,
    cancelId: opts.cancelId !== undefined ? validateNumber(opts.cancelId) : undefined,
    noLink: typeof opts.noLink === 'boolean' ? opts.noLink : undefined,
    normalizeAccessKeys: typeof opts.normalizeAccessKeys === 'boolean' ? opts.normalizeAccessKeys : undefined,
  };
}

// 速率限制
class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  private readonly maxCalls = 10;
  private readonly timeWindow = 1000; // 1秒

  canCall(method: string): boolean {
    const now = Date.now();
    const methodCalls = this.calls.get(method) || [];
    
    // 清理过期的调用记录
    const validCalls = methodCalls.filter(time => now - time < this.timeWindow);
    
    if (validCalls.length >= this.maxCalls) {
      return false;
    }
    
    validCalls.push(now);
    this.calls.set(method, validCalls);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// 安全的IPC调用包装器
function secureIpcInvoke<T = any>(channel: string, ...args: any[]): Promise<T> {
  // 速率限制检查
  if (!rateLimiter.canCall(channel)) {
    throw new Error(`Rate limit exceeded for ${channel}`);
  }
  
  // 验证通道名称
  const allowedChannels = [
    'get-app-version',
    'get-platform',
    'show-message-box',
    'show-error-box',
    'get-window-bounds',
    'set-window-bounds',
    'center-window',
    'minimize-window',
    'maximize-window',
    'close-window',
    'is-window-maximized',
    'is-window-minimized',
    'open-external',
  ];
  
  if (!allowedChannels.includes(channel)) {
    throw new Error(`Unauthorized channel: ${channel}`);
  }
  
  return ipcRenderer.invoke(channel, ...args);
}

// 安全的事件监听器
function secureIpcOn(channel: string, listener: (...args: any[]) => void): void {
  const allowedChannels = [
    'main-process-message',
    'refresh-weather',
    'open-settings',
    'change-location',
    'check-updates',
  ];
  
  if (!allowedChannels.includes(channel)) {
    throw new Error(`Unauthorized channel: ${channel}`);
  }
  
  ipcRenderer.on(channel, listener);
}

function secureIpcOff(channel: string, listener: (...args: any[]) => void): void {
  ipcRenderer.off(channel, listener);
}

// DOM操作工具
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(c => c === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(c => c === child)) {
      return parent.removeChild(child);
    }
  },
};

// 暴露给渲染进程的安全API
const electronAPI = {
  // 应用信息
  getVersion: async (): Promise<string> => {
    try {
      return await secureIpcInvoke<string>('get-app-version');
    } catch (error) {
      console.error('Failed to get app version:', error);
      throw error;
    }
  },

  getPlatform: async (): Promise<string> => {
    try {
      return await secureIpcInvoke<string>('get-platform');
    } catch (error) {
      console.error('Failed to get platform:', error);
      throw error;
    }
  },

  // 对话框
  showMessageBox: async (options: MessageBoxOptions): Promise<MessageBoxResult> => {
    try {
      const validatedOptions = validateMessageBoxOptions(options);
      return await secureIpcInvoke<MessageBoxResult>('show-message-box', validatedOptions);
    } catch (error) {
      console.error('Failed to show message box:', error);
      throw error;
    }
  },

  showErrorBox: async (title: string, content: string): Promise<void> => {
    try {
      const validatedTitle = validateString(title);
      const validatedContent = validateString(content);
      await secureIpcInvoke('show-error-box', validatedTitle, validatedContent);
    } catch (error) {
      console.error('Failed to show error box:', error);
      throw error;
    }
  },

  // 窗口管理
  getWindowBounds: async (): Promise<WindowBounds> => {
    try {
      return await secureIpcInvoke<WindowBounds>('get-window-bounds');
    } catch (error) {
      console.error('Failed to get window bounds:', error);
      throw error;
    }
  },

  setWindowBounds: async (bounds: WindowBounds): Promise<void> => {
    try {
      const validatedBounds = validateBounds(bounds);
      await secureIpcInvoke('set-window-bounds', validatedBounds);
    } catch (error) {
      console.error('Failed to set window bounds:', error);
      throw error;
    }
  },

  centerWindow: async (): Promise<void> => {
    try {
      await secureIpcInvoke('center-window');
    } catch (error) {
      console.error('Failed to center window:', error);
      throw error;
    }
  },

  minimizeWindow: async (): Promise<void> => {
    try {
      await secureIpcInvoke('minimize-window');
    } catch (error) {
      console.error('Failed to minimize window:', error);
      throw error;
    }
  },

  maximizeWindow: async (): Promise<void> => {
    try {
      await secureIpcInvoke('maximize-window');
    } catch (error) {
      console.error('Failed to maximize window:', error);
      throw error;
    }
  },

  closeWindow: async (): Promise<void> => {
    try {
      await secureIpcInvoke('close-window');
    } catch (error) {
      console.error('Failed to close window:', error);
      throw error;
    }
  },

  isWindowMaximized: async (): Promise<boolean> => {
    try {
      return await secureIpcInvoke<boolean>('is-window-maximized');
    } catch (error) {
      console.error('Failed to check if window is maximized:', error);
      throw error;
    }
  },

  isWindowMinimized: async (): Promise<boolean> => {
    try {
      return await secureIpcInvoke<boolean>('is-window-minimized');
    } catch (error) {
      console.error('Failed to check if window is minimized:', error);
      throw error;
    }
  },

  // 外部链接
  openExternal: async (url: string): Promise<void> => {
    try {
      const validatedUrl = validateString(url);
      
      // 额外的URL安全验证
      if (!validatedUrl.startsWith('http://') && !validatedUrl.startsWith('https://') && !validatedUrl.startsWith('mailto:')) {
        throw new Error('Invalid URL protocol');
      }
      
      await secureIpcInvoke('open-external', validatedUrl);
    } catch (error) {
      console.error('Failed to open external URL:', error);
      throw error;
    }
  },

  // 事件监听
  on: (channel: string, listener: (...args: any[]) => void): void => {
    try {
      secureIpcOn(channel, listener);
    } catch (error) {
      console.error('Failed to add event listener:', error);
      throw error;
    }
  },

  off: (channel: string, listener: (...args: any[]) => void): void => {
    try {
      secureIpcOff(channel, listener);
    } catch (error) {
      console.error('Failed to remove event listener:', error);
      throw error;
    }
  },

  // 实用工具
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  safeDOM,
  isElectron: true,
};

// 类型声明
export interface ElectronAPI {
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  showMessageBox: (options: MessageBoxOptions) => Promise<MessageBoxResult>;
  showErrorBox: (title: string, content: string) => Promise<void>;
  getWindowBounds: () => Promise<WindowBounds>;
  setWindowBounds: (bounds: WindowBounds) => Promise<void>;
  centerWindow: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isWindowMaximized: () => Promise<boolean>;
  isWindowMinimized: () => Promise<boolean>;
  openExternal: (url: string) => Promise<void>;
  on: (channel: string, listener: (...args: any[]) => void) => void;
  off: (channel: string, listener: (...args: any[]) => void) => void;
  platform: NodeJS.Platform;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  safeDOM: typeof safeDOM;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// 安全地暴露API到渲染进程
try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
} catch (error) {
  console.error('Failed to expose electron API:', error);
  
  // 如果contextBridge不可用，在开发环境下提供fallback
  if (process.env.NODE_ENV === 'development') {
    (window as any).electronAPI = electronAPI;
  }
}

// 安全日志记录
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

// 在生产环境中过滤敏感信息
if (process.env.NODE_ENV === 'production') {
  console.log = (...args: any[]) => {
    const filteredArgs = args.map(arg => {
      if (typeof arg === 'string' && (arg.includes('password') || arg.includes('token') || arg.includes('key'))) {
        return '[FILTERED]';
      }
      return arg;
    });
    originalConsole.log(...filteredArgs);
  };
}

// 错误边界
window.addEventListener('error', (event) => {
  console.error('Preload script error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Preload script unhandled rejection:', event.reason);
});

// DOM准备就绪后的初始化
domReady().then(() => {
  console.log('Preload script loaded successfully');
});

export type { WindowBounds, MessageBoxOptions, MessageBoxResult };