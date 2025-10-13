import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import * as path from 'path';

export interface TrayConfig {
  iconPath?: string;
  tooltip?: string;
  title?: string;
}

export class TrayManager {
  private tray: Tray | null = null;
  private window: BrowserWindow | null = null;
  private config: TrayConfig;

  constructor(config: TrayConfig = {}) {
    this.config = {
      iconPath: config.iconPath || this.getDefaultIconPath(),
      tooltip: config.tooltip || 'WeatherDuck',
      title: config.title || 'WeatherDuck',
    };
  }

  /**
   * 创建系统托盘
   */
  createTray(): Tray | null {
    try {
      if (this.tray) {
        this.destroyTray();
      }

      // 创建托盘图标
      const icon = this.createTrayIcon();
      if (!icon) {
        throw new Error('Failed to create tray icon');
      }

      this.tray = new Tray(icon);
      
      // 设置托盘属性
      this.setupTrayProperties();
      
      // 设置托盘菜单
      this.setupTrayMenu();
      
      // 绑定托盘事件
      this.bindTrayEvents();

      console.log('System tray created successfully');
      return this.tray;
    } catch (error) {
      console.error('Failed to create system tray:', error);
      return null;
    }
  }

  /**
   * 设置窗口引用
   */
  setWindow(window: BrowserWindow): void {
    this.window = window;
    
    // 如果托盘已存在，更新菜单
    if (this.tray) {
      this.setupTrayMenu();
    }
  }

  /**
   * 更新托盘工具提示
   */
  setTooltip(tooltip: string): void {
    if (this.tray && !this.tray.isDestroyed()) {
      try {
        this.tray.setToolTip(tooltip);
        this.config.tooltip = tooltip;
      } catch (error) {
        console.error('Failed to set tray tooltip:', error);
      }
    }
  }

  /**
   * 更新托盘标题
   */
  setTitle(title: string): void {
    if (this.tray && !this.tray.isDestroyed()) {
      try {
        this.tray.setTitle(title);
        this.config.title = title;
      } catch (error) {
        console.error('Failed to set tray title:', error);
      }
    }
  }

  /**
   * 更新托盘图标
   */
  setIcon(iconPath: string): void {
    if (this.tray && !this.tray.isDestroyed()) {
      try {
        const icon = this.createTrayIcon(iconPath);
        if (icon) {
          this.tray.setImage(icon);
          this.config.iconPath = iconPath;
        }
      } catch (error) {
        console.error('Failed to set tray icon:', error);
      }
    }
  }

  /**
   * 显示托盘气球通知
   */
  displayBalloon(title: string, content: string, icon?: string): void {
    if (this.tray && !this.tray.isDestroyed()) {
      try {
        const balloonIcon = icon ? nativeImage.createFromPath(icon) : undefined;
        this.tray.displayBalloon({
          title,
          content,
          icon: balloonIcon,
        });
      } catch (error) {
        console.error('Failed to display balloon:', error);
      }
    }
  }

  /**
   * 销毁托盘
   */
  destroyTray(): void {
    if (this.tray && !this.tray.isDestroyed()) {
      try {
        this.tray.destroy();
        console.log('System tray destroyed');
      } catch (error) {
        console.error('Failed to destroy tray:', error);
      }
    }
    this.tray = null;
  }

  /**
   * 获取托盘实例
   */
  getTray(): Tray | null {
    return this.tray;
  }

  /**
   * 检查托盘是否存在且有效
   */
  isValid(): boolean {
    return this.tray !== null && !this.tray.isDestroyed();
  }

  /**
   * 创建托盘图标
   */
  private createTrayIcon(iconPath?: string): nativeImage | null {
    try {
      const imagePath = iconPath || this.config.iconPath;
      if (!imagePath) {
        throw new Error('No icon path provided');
      }

      let icon: nativeImage;
      
      if (path.isAbsolute(imagePath)) {
        icon = nativeImage.createFromPath(imagePath);
      } else {
        // 相对路径，从应用资源目录解析
        const fullPath = path.join(__dirname, '..', '..', imagePath);
        icon = nativeImage.createFromPath(fullPath);
      }

      if (icon.isEmpty()) {
        throw new Error(`Failed to load icon from path: ${imagePath}`);
      }

      // 在macOS上调整图标大小
      if (process.platform === 'darwin') {
        icon = icon.resize({ width: 16, height: 16 });
      }

      return icon;
    } catch (error) {
      console.error('Failed to create tray icon:', error);
      
      // 尝试创建默认图标
      try {
        return nativeImage.createEmpty();
      } catch (fallbackError) {
        console.error('Failed to create fallback icon:', fallbackError);
        return null;
      }
    }
  }

  /**
   * 设置托盘属性
   */
  private setupTrayProperties(): void {
    if (!this.tray) return;

    try {
      // 设置工具提示
      if (this.config.tooltip) {
        this.tray.setToolTip(this.config.tooltip);
      }

      // 设置标题（主要在macOS上有效）
      if (this.config.title && process.platform === 'darwin') {
        this.tray.setTitle(this.config.title);
      }
    } catch (error) {
      console.error('Failed to setup tray properties:', error);
    }
  }

  /**
   * 设置托盘菜单
   */
  private setupTrayMenu(): void {
    if (!this.tray) return;

    try {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: '显示窗口',
          click: () => this.showWindow(),
        },
        {
          label: '隐藏窗口',
          click: () => this.hideWindow(),
        },
        { type: 'separator' },
        {
          label: '刷新天气',
          click: () => this.refreshWeather(),
        },
        {
          label: '设置',
          click: () => this.openSettings(),
        },
        { type: 'separator' },
        {
          label: '关于',
          click: () => this.showAbout(),
        },
        {
          label: '退出',
          click: () => this.quitApp(),
        },
      ]);

      this.tray.setContextMenu(contextMenu);
    } catch (error) {
      console.error('Failed to setup tray menu:', error);
    }
  }

  /**
   * 绑定托盘事件
   */
  private bindTrayEvents(): void {
    if (!this.tray) return;

    try {
      // 单击托盘图标
      this.tray.on('click', () => {
        this.toggleWindow();
      });

      // 双击托盘图标
      this.tray.on('double-click', () => {
        this.showWindow();
      });

      // 右键点击（在某些平台上）
      this.tray.on('right-click', () => {
        // 右键菜单会自动显示，这里可以添加额外逻辑
      });

      // 气球通知点击
      this.tray.on('balloon-click', () => {
        this.showWindow();
      });

      // 气球通知关闭
      this.tray.on('balloon-closed', () => {
        // 可以添加气球通知关闭后的逻辑
      });
    } catch (error) {
      console.error('Failed to bind tray events:', error);
    }
  }

  /**
   * 显示窗口
   */
  private showWindow(): void {
    if (this.window && !this.window.isDestroyed()) {
      try {
        if (this.window.isMinimized()) {
          this.window.restore();
        }
        this.window.show();
        this.window.focus();
      } catch (error) {
        console.error('Failed to show window from tray:', error);
      }
    }
  }

  /**
   * 隐藏窗口
   */
  private hideWindow(): void {
    if (this.window && !this.window.isDestroyed()) {
      try {
        this.window.hide();
      } catch (error) {
        console.error('Failed to hide window from tray:', error);
      }
    }
  }

  /**
   * 切换窗口显示状态
   */
  private toggleWindow(): void {
    if (this.window && !this.window.isDestroyed()) {
      try {
        if (this.window.isVisible()) {
          this.window.hide();
        } else {
          this.showWindow();
        }
      } catch (error) {
        console.error('Failed to toggle window from tray:', error);
      }
    }
  }

  /**
   * 刷新天气
   */
  private refreshWeather(): void {
    if (this.window && !this.window.isDestroyed()) {
      try {
        this.window.webContents.send('refresh-weather');
      } catch (error) {
        console.error('Failed to refresh weather from tray:', error);
      }
    }
  }

  /**
   * 打开设置
   */
  private openSettings(): void {
    if (this.window && !this.window.isDestroyed()) {
      try {
        this.window.webContents.send('open-settings');
        this.showWindow();
      } catch (error) {
        console.error('Failed to open settings from tray:', error);
      }
    }
  }

  /**
   * 显示关于信息
   */
  private showAbout(): void {
    if (this.window && !this.window.isDestroyed()) {
      try {
        this.window.webContents.send('show-about');
        this.showWindow();
      } catch (error) {
        console.error('Failed to show about from tray:', error);
      }
    }
  }

  /**
   * 退出应用
   */
  private quitApp(): void {
    try {
      app.quit();
    } catch (error) {
      console.error('Failed to quit app from tray:', error);
    }
  }

  /**
   * 获取默认图标路径
   */
  private getDefaultIconPath(): string {
    // 根据平台返回不同的默认图标路径
    switch (process.platform) {
      case 'win32':
        return 'assets/icon.ico';
      case 'darwin':
        return 'assets/icon.icns';
      default:
        return 'assets/icon.png';
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.destroyTray();
    this.window = null;
  }
}