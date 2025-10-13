import { BrowserWindow, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized?: boolean;
  isMinimized?: boolean;
  isFullScreen?: boolean;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class WindowStateManager {
  private readonly stateFilePath: string;
  private readonly defaultState: WindowState;
  private window: BrowserWindow | null = null;

  constructor(
    windowName: string = 'main',
    defaultState: WindowState = {
      width: 1200,
      height: 800,
      isMaximized: false,
      isMinimized: false,
      isFullScreen: false,
    }
  ) {
    this.stateFilePath = path.join(app.getPath('userData'), `window-state-${windowName}.json`);
    this.defaultState = defaultState;
  }

  /**
   * 加载窗口状态
   */
  loadState(): WindowState {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const stateData = fs.readFileSync(this.stateFilePath, 'utf8');
        const state = JSON.parse(stateData) as WindowState;
        
        // 验证状态数据的有效性
        if (this.isValidState(state)) {
          // 确保窗口位置在屏幕范围内
          const validatedState = this.validatePosition(state);
          return { ...this.defaultState, ...validatedState };
        }
      }
    } catch (error) {
      console.error('Failed to load window state:', error);
    }
    
    return this.defaultState;
  }

  /**
   * 保存窗口状态
   */
  saveState(state?: WindowState): void {
    try {
      const stateToSave = state || this.getCurrentState();
      if (stateToSave) {
        const stateData = JSON.stringify(stateToSave, null, 2);
        fs.writeFileSync(this.stateFilePath, stateData, 'utf8');
      }
    } catch (error) {
      console.error('Failed to save window state:', error);
    }
  }

  /**
   * 获取当前窗口状态
   */
  getCurrentState(): WindowState | null {
    if (!this.window || this.window.isDestroyed()) {
      return null;
    }

    try {
      const bounds = this.window.getBounds();
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized: this.window.isMaximized(),
        isMinimized: this.window.isMinimized(),
        isFullScreen: this.window.isFullScreen(),
      };
    } catch (error) {
      console.error('Failed to get current window state:', error);
      return null;
    }
  }

  /**
   * 设置窗口引用并绑定事件监听器
   */
  setWindow(window: BrowserWindow): void {
    this.window = window;
    this.bindEvents();
  }

  /**
   * 应用状态到窗口
   */
  applyState(window: BrowserWindow, state?: WindowState): void {
    const stateToApply = state || this.loadState();
    
    try {
      // 设置窗口尺寸和位置
      if (stateToApply.x !== undefined && stateToApply.y !== undefined) {
        window.setBounds({
          x: stateToApply.x,
          y: stateToApply.y,
          width: stateToApply.width,
          height: stateToApply.height,
        });
      } else {
        window.setSize(stateToApply.width, stateToApply.height);
        window.center();
      }

      // 应用窗口状态
      if (stateToApply.isMaximized) {
        window.maximize();
      }
      
      if (stateToApply.isFullScreen) {
        window.setFullScreen(true);
      }
    } catch (error) {
      console.error('Failed to apply window state:', error);
      // 如果应用状态失败，使用默认状态
      window.setSize(this.defaultState.width, this.defaultState.height);
      window.center();
    }
  }

  /**
   * 获取窗口边界
   */
  getWindowBounds(): WindowBounds | null {
    if (!this.window || this.window.isDestroyed()) {
      return null;
    }

    try {
      return this.window.getBounds();
    } catch (error) {
      console.error('Failed to get window bounds:', error);
      return null;
    }
  }

  /**
   * 设置窗口边界
   */
  setWindowBounds(bounds: WindowBounds): void {
    if (!this.window || this.window.isDestroyed()) {
      throw new Error('Window is not available');
    }

    try {
      // 验证边界值
      const validatedBounds = this.validateBounds(bounds);
      this.window.setBounds(validatedBounds);
    } catch (error) {
      console.error('Failed to set window bounds:', error);
      throw error;
    }
  }

  /**
   * 居中窗口
   */
  centerWindow(): void {
    if (!this.window || this.window.isDestroyed()) {
      throw new Error('Window is not available');
    }

    try {
      this.window.center();
    } catch (error) {
      console.error('Failed to center window:', error);
      throw error;
    }
  }

  /**
   * 最小化窗口
   */
  minimizeWindow(): void {
    if (!this.window || this.window.isDestroyed()) {
      throw new Error('Window is not available');
    }

    try {
      this.window.minimize();
    } catch (error) {
      console.error('Failed to minimize window:', error);
      throw error;
    }
  }

  /**
   * 最大化窗口
   */
  maximizeWindow(): void {
    if (!this.window || this.window.isDestroyed()) {
      throw new Error('Window is not available');
    }

    try {
      if (this.window.isMaximized()) {
        this.window.unmaximize();
      } else {
        this.window.maximize();
      }
    } catch (error) {
      console.error('Failed to maximize window:', error);
      throw error;
    }
  }

  /**
   * 关闭窗口
   */
  closeWindow(): void {
    if (!this.window || this.window.isDestroyed()) {
      throw new Error('Window is not available');
    }

    try {
      this.window.close();
    } catch (error) {
      console.error('Failed to close window:', error);
      throw error;
    }
  }

  /**
   * 检查窗口是否最大化
   */
  isWindowMaximized(): boolean {
    if (!this.window || this.window.isDestroyed()) {
      return false;
    }

    try {
      return this.window.isMaximized();
    } catch (error) {
      console.error('Failed to check if window is maximized:', error);
      return false;
    }
  }

  /**
   * 检查窗口是否最小化
   */
  isWindowMinimized(): boolean {
    if (!this.window || this.window.isDestroyed()) {
      return false;
    }

    try {
      return this.window.isMinimized();
    } catch (error) {
      console.error('Failed to check if window is minimized:', error);
      return false;
    }
  }

  /**
   * 绑定窗口事件监听器
   */
  private bindEvents(): void {
    if (!this.window) return;

    // 窗口移动事件
    this.window.on('move', () => {
      this.saveState();
    });

    // 窗口调整大小事件
    this.window.on('resize', () => {
      this.saveState();
    });

    // 窗口最大化事件
    this.window.on('maximize', () => {
      this.saveState();
    });

    // 窗口取消最大化事件
    this.window.on('unmaximize', () => {
      this.saveState();
    });

    // 窗口最小化事件
    this.window.on('minimize', () => {
      this.saveState();
    });

    // 窗口恢复事件
    this.window.on('restore', () => {
      this.saveState();
    });

    // 窗口关闭前保存状态
    this.window.on('close', () => {
      this.saveState();
    });
  }

  /**
   * 验证状态数据的有效性
   */
  private isValidState(state: any): state is WindowState {
    return (
      typeof state === 'object' &&
      state !== null &&
      typeof state.width === 'number' &&
      typeof state.height === 'number' &&
      state.width > 0 &&
      state.height > 0 &&
      state.width <= 10000 &&
      state.height <= 10000 &&
      (state.x === undefined || typeof state.x === 'number') &&
      (state.y === undefined || typeof state.y === 'number')
    );
  }

  /**
   * 验证窗口位置是否在屏幕范围内
   */
  private validatePosition(state: WindowState): WindowState {
    if (state.x === undefined || state.y === undefined) {
      return state;
    }

    try {
      const displays = screen.getAllDisplays();
      const windowBounds = {
        x: state.x,
        y: state.y,
        width: state.width,
        height: state.height,
      };

      // 检查窗口是否在任何显示器上可见
      const isVisible = displays.some(display => {
        const { x, y, width, height } = display.bounds;
        return (
          windowBounds.x < x + width &&
          windowBounds.x + windowBounds.width > x &&
          windowBounds.y < y + height &&
          windowBounds.y + windowBounds.height > y
        );
      });

      if (!isVisible) {
        // 如果窗口不在任何显示器上，移除位置信息，让窗口居中
        return {
          ...state,
          x: undefined,
          y: undefined,
        };
      }

      return state;
    } catch (error) {
      console.error('Failed to validate window position:', error);
      return {
        ...state,
        x: undefined,
        y: undefined,
      };
    }
  }

  /**
   * 验证边界值
   */
  private validateBounds(bounds: WindowBounds): WindowBounds {
    const minWidth = 300;
    const minHeight = 200;
    const maxWidth = 10000;
    const maxHeight = 10000;

    return {
      x: Math.max(-10000, Math.min(10000, bounds.x)),
      y: Math.max(-10000, Math.min(10000, bounds.y)),
      width: Math.max(minWidth, Math.min(maxWidth, bounds.width)),
      height: Math.max(minHeight, Math.min(maxHeight, bounds.height)),
    };
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.saveState();
      this.window.removeAllListeners();
    }
    this.window = null;
  }
}