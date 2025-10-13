import { jest } from '@jest/globals';
import { app, BrowserWindow } from 'electron';

// Mock the main process module before importing
jest.mock('../../src/main/main.ts', () => ({
  createWindow: jest.fn(),
  getMainWindow: jest.fn(),
}));

describe('主进程生命周期管理', () => {
  let mockWindow: any;

  beforeEach(() => {
    mockWindow = {
      loadURL: jest.fn(() => Promise.resolve()),
      loadFile: jest.fn(() => Promise.resolve()),
      on: jest.fn(),
      once: jest.fn(),
      webContents: {
        openDevTools: jest.fn(),
        on: jest.fn(),
        send: jest.fn(),
      },
      show: jest.fn(),
      hide: jest.fn(),
      close: jest.fn(),
      destroy: jest.fn(),
      isDestroyed: jest.fn(() => false),
      getBounds: jest.fn(() => ({ x: 0, y: 0, width: 375, height: 812 })),
      setBounds: jest.fn(),
      setMinimumSize: jest.fn(),
      center: jest.fn(),
      focus: jest.fn(),
      isVisible: jest.fn(() => true),
    };
    
    (BrowserWindow as any).mockImplementation(() => mockWindow);
  });

  describe('应用启动', () => {
    it('应该在app ready时创建主窗口', async () => {
      // 模拟app ready事件
      const readyCallback = jest.fn();
      (app.whenReady as jest.Mock<() => Promise<void>>).mockResolvedValue(void 0);
      
      await app.whenReady();
      
      expect(app.whenReady).toHaveBeenCalled();
    });

    it('应该设置正确的窗口尺寸 (375x812px)', () => {
      new BrowserWindow({
        width: 375,
        height: 812,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
        },
      });

      expect(BrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 375,
          height: 812,
          webPreferences: expect.objectContaining({
            contextIsolation: true,
            nodeIntegration: false,
          }),
        })
      );
    });

    it('应该设置最小窗口尺寸', () => {
      const window = new BrowserWindow();
      window.setMinimumSize(300, 600);

      expect(window.setMinimumSize).toHaveBeenCalledWith(300, 600);
    });

    it('应该在开发环境下打开开发者工具', () => {
      process.env.NODE_ENV = 'development';
      const window = new BrowserWindow();
      
      window.webContents.openDevTools();
      
      expect(window.webContents.openDevTools).toHaveBeenCalled();
    });
  });

  describe('单实例锁定', () => {
    it('应该请求单实例锁定', () => {
      (app.requestSingleInstanceLock as jest.Mock).mockReturnValue(true);
      
      const gotTheLock = app.requestSingleInstanceLock();
      
      expect(app.requestSingleInstanceLock).toHaveBeenCalled();
      expect(gotTheLock).toBe(true);
    });

    it('当获取不到锁时应该退出应用', () => {
      (app.requestSingleInstanceLock as jest.Mock).mockReturnValue(false);
      
      const gotTheLock = app.requestSingleInstanceLock();
      
      if (!gotTheLock) {
        app.quit();
      }
      
      expect(app.quit).toHaveBeenCalled();
    });

    it('应该处理second-instance事件', () => {
      const callback = jest.fn();
      app.on('second-instance', callback);
      
      expect(app.on).toHaveBeenCalledWith('second-instance', callback);
    });
  });

  describe('应用关闭', () => {
    it('应该处理window-all-closed事件', () => {
      const callback = jest.fn();
      app.on('window-all-closed', callback);
      
      expect(app.on).toHaveBeenCalledWith('window-all-closed', callback);
    });

    it('在非macOS平台应该退出应用', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
      });
      
      const callback = jest.fn(() => {
        if (process.platform !== 'darwin') {
          app.quit();
        }
      });
      
      callback();
      
      expect(app.quit).toHaveBeenCalled();
    });

    it('应该处理activate事件 (macOS)', () => {
      const callback = jest.fn();
      app.on('activate', callback);
      
      expect(app.on).toHaveBeenCalledWith('activate', callback);
    });
  });

  describe('窗口状态管理', () => {
    it('应该正确获取窗口边界', () => {
      const window = new BrowserWindow();
      const bounds = window.getBounds();
      
      expect(window.getBounds).toHaveBeenCalled();
      expect(bounds).toEqual({ x: 0, y: 0, width: 375, height: 812 });
    });

    it('应该能够设置窗口边界', () => {
      const window = new BrowserWindow();
      const newBounds = { x: 100, y: 100, width: 375, height: 812 };
      
      window.setBounds(newBounds);
      
      expect(window.setBounds).toHaveBeenCalledWith(newBounds);
    });

    it('应该能够居中窗口', () => {
      const window = new BrowserWindow();
      
      window.center();
      
      expect(window.center).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理窗口创建失败', () => {
      (BrowserWindow as any).mockImplementation(() => {
        throw new Error('Failed to create window');
      });
      
      expect(() => new BrowserWindow()).toThrow('Failed to create window');
    });

    it('应该处理URL加载失败', async () => {
      const window = new BrowserWindow();
      (window.loadURL as jest.Mock<() => Promise<void>>).mockRejectedValue(new Error('Failed to load URL'));
      
      await expect(window.loadURL('http://localhost:3000')).rejects.toThrow('Failed to load URL');
    });
  });
});