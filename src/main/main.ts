import { app, BrowserWindow, shell, ipcMain, Menu, dialog, Tray, nativeImage } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { update } from './update';
import { WindowStateManager } from './window-state-manager';
import { TrayManager } from './tray-manager';
import { MenuManager } from './menu-manager';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 应用配置
const APP_CONFIG = {
  window: {
    width: 375,
    height: 812,
    minWidth: 320,
    minHeight: 568,
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// 路径配置
process.env.APP_ROOT = path.join(__dirname, '../..');
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

// 禁用Windows 7的GPU加速
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration();

// 设置Windows 10+通知的应用名称
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

// 单实例锁定
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// 全局变量
let win: BrowserWindow | null = null;
let windowStateManager: WindowStateManager | null = null;
let trayManager: TrayManager | null = null;
let menuManager: MenuManager | null = null;
const preload = path.join(__dirname, '../preload/index.mjs');
const indexHtml = path.join(RENDERER_DIST, 'index.html');
const windowStateFile = path.join(app.getPath('userData'), 'window-state.json');

// 窗口状态管理
interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized?: boolean;
  isMinimized?: boolean;
}

class WindowStateManager {
  private defaultState: WindowState = {
    width: APP_CONFIG.window.width,
    height: APP_CONFIG.window.height,
  };

  loadState(): WindowState {
    try {
      if (fs.existsSync(windowStateFile)) {
        const data = fs.readFileSync(windowStateFile, 'utf8');
        const state = JSON.parse(data);
        
        // 验证状态数据
        if (this.isValidState(state)) {
          return { ...this.defaultState, ...state };
        }
      }
    } catch (error) {
      console.error('Failed to load window state:', error);
    }
    
    return this.defaultState;
  }

  saveState(window: BrowserWindow): void {
    try {
      const bounds = window.getBounds();
      const state: WindowState = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized: window.isMaximized(),
        isMinimized: window.isMinimized(),
      };
      
      fs.writeFileSync(windowStateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Failed to save window state:', error);
    }
  }

  private isValidState(state: any): boolean {
    return (
      typeof state === 'object' &&
      typeof state.width === 'number' &&
      typeof state.height === 'number' &&
      state.width >= APP_CONFIG.window.minWidth &&
      state.height >= APP_CONFIG.window.minHeight
    );
  }
}

const windowStateManager = new WindowStateManager();

// 创建主窗口
async function createWindow(): Promise<BrowserWindow> {
  try {
    // 初始化窗口状态管理器
    windowStateManager = new WindowStateManager();
    
    const windowState = windowStateManager.loadState();
    
    win = new BrowserWindow({
      title: '天气鸭 - WeatherDuck',
      icon: path.join(process.env.VITE_PUBLIC || RENDERER_DIST, 'favicon.ico'),
      width: windowState.width,
      height: windowState.height,
      x: windowState.x,
      y: windowState.y,
      minWidth: APP_CONFIG.window.minWidth,
      minHeight: APP_CONFIG.window.minHeight,
      webPreferences: {
        preload,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
      },
      show: false,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      resizable: true,
    });

    // 恢复窗口状态
    if (windowState.isMaximized) {
      win.maximize();
    }

    // 居中窗口（如果没有保存的位置）
    if (!windowState.x && !windowState.y) {
      win.center();
    }

    // 加载应用内容
    if (VITE_DEV_SERVER_URL) {
      await win.loadURL(VITE_DEV_SERVER_URL);
      if (APP_CONFIG.isDevelopment) {
        win.webContents.openDevTools();
      }
    } else {
      await win.loadFile(indexHtml);
    }

    // 窗口事件处理
    setupWindowEvents(win);

    // 外部链接处理
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (isUrlSafe(url)) {
        shell.openExternal(url);
      }
      return { action: 'deny' };
    });

    // 应用更新
    update(win);

    // 显示窗口
    win.once('ready-to-show', () => {
      win?.show();
      
      if (APP_CONFIG.isDevelopment) {
        win?.webContents.openDevTools();
      }
    });

    return win;
  } catch (error) {
    console.error('Failed to create window:', error);
    throw error;
  }
}

// 设置窗口事件
function setupWindowEvents(window: BrowserWindow): void {
  // 窗口移动事件
  window.on('moved', () => {
    windowStateManager.saveState(window);
  });

  // 窗口大小调整事件
  window.on('resized', () => {
    windowStateManager.saveState(window);
  });

  // 窗口最小化事件
  window.on('minimize', () => {
    windowStateManager.saveState(window);
  });

  // 窗口恢复事件
  window.on('restore', () => {
    windowStateManager.saveState(window);
  });

  // 窗口关闭前保存状态
  window.on('close', () => {
    windowStateManager.saveState(window);
  });

  // 发送主进程消息
  window.webContents.on('did-finish-load', () => {
    window.webContents.send('main-process-message', new Date().toLocaleString());
  });
}

// URL安全性验证
function isUrlSafe(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    const blockedDomains = ['malicious.com', 'phishing.net'];
    
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false;
    }
    
    if (blockedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// 创建系统托盘
function createTray(): void {
  try {
    trayManager = new TrayManager(win);
    console.log('System tray created successfully');
  } catch (error) {
    console.error('Failed to create system tray:', error);
  }
}

// 创建应用菜单
function createMenu(): void {
  try {
    menuManager = new MenuManager(win);
    console.log('Application menu created successfully');
  } catch (error) {
    console.error('Failed to create application menu:', error);
  }
}

// 应用准备就绪
app.whenReady().then(async () => {
  try {
    // 创建主窗口
    await createWindow();
    
    // 创建系统托盘
    createTray();
    
    // 创建应用菜单
    createMenu();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // 保存窗口状态
  if (win && windowStateManager) {
    windowStateManager.saveState(win);
  }
  
  win = null;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

app.on('before-quit', () => {
  // 保存窗口状态
  if (win && windowStateManager) {
    windowStateManager.saveState(win);
  }
  
  // 清理托盘
  if (trayManager) {
    trayManager.destroy();
  }
});

// IPC 处理器
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-name', () => {
  return app.getName();
});

ipcMain.handle('get-app-path', (event, name) => {
  return app.getPath(name as any);
});

ipcMain.handle('show-message-box', async (event, options) => {
  try {
    if (!win) throw new Error('Main window not available');
    
    const result = await dialog.showMessageBox(win, {
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      detail: options.detail || '',
      buttons: options.buttons || ['确定'],
      defaultId: options.defaultId || 0,
      cancelId: options.cancelId
    });
    
    return result;
  } catch (error) {
    console.error('Failed to show message box:', error);
    throw error;
  }
});

ipcMain.handle('show-error-box', (event, title, content) => {
  try {
    dialog.showErrorBox(title, content);
  } catch (error) {
    console.error('Failed to show error box:', error);
    throw error;
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    if (!isUrlSafe(url)) {
      throw new Error('URL is not safe');
    }
    await shell.openExternal(url);
    return true;
  } catch (error) {
    console.error('Failed to open external URL:', error);
    throw error;
  }
});

// 窗口管理相关的IPC处理器
ipcMain.handle('window-minimize', () => {
  if (windowStateManager && win) {
    windowStateManager.saveState(win);
    win.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (windowStateManager && win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
    windowStateManager.saveState(win);
  }
});

ipcMain.handle('window-close', () => {
  if (windowStateManager && win) {
    windowStateManager.saveState(win);
    win.close();
  }
});

ipcMain.handle('window-hide', () => {
  win?.hide();
});

ipcMain.handle('window-show', () => {
  win?.show();
});

ipcMain.handle('window-focus', () => {
  win?.focus();
});

ipcMain.handle('window-center', () => {
  if (windowStateManager && win) {
    win.center();
    windowStateManager.saveState(win);
  }
});

ipcMain.handle('window-set-always-on-top', (event, flag) => {
  win?.setAlwaysOnTop(flag);
});

ipcMain.handle('window-get-bounds', () => {
  return win?.getBounds();
});

ipcMain.handle('window-set-bounds', (event, bounds) => {
  if (windowStateManager && win) {
    win.setBounds(bounds);
    windowStateManager.saveState(win);
  }
});

ipcMain.handle('window-is-maximized', () => {
  return win?.isMaximized() || false;
});

ipcMain.handle('window-is-minimized', () => {
  return win?.isMinimized() || false;
});

ipcMain.handle('window-is-visible', () => {
  return win?.isVisible() || false;
});

ipcMain.handle('window-save-state', () => {
  if (windowStateManager && win) {
    windowStateManager.saveState(win);
  }
});

ipcMain.handle('window-load-state', () => {
  if (windowStateManager) {
    return windowStateManager.loadState();
  }
  return null;
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});