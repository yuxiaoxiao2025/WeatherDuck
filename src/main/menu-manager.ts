import { Menu, MenuItem, BrowserWindow, app, shell, dialog } from 'electron';

export interface MenuConfig {
  enableDevTools?: boolean;
  enableAutoUpdater?: boolean;
  appName?: string;
  appVersion?: string;
}

export class MenuManager {
  private window: BrowserWindow | null = null;
  private config: MenuConfig;
  private menu: Menu | null = null;

  constructor(config: MenuConfig = {}) {
    this.config = {
      enableDevTools: config.enableDevTools ?? process.env.NODE_ENV === 'development',
      enableAutoUpdater: config.enableAutoUpdater ?? true,
      appName: config.appName || 'WeatherDuck',
      appVersion: config.appVersion || app.getVersion(),
    };
  }

  /**
   * 设置窗口引用
   */
  setWindow(window: BrowserWindow): void {
    this.window = window;
  }

  /**
   * 创建应用菜单
   */
  createMenu(): Menu {
    try {
      const template = this.buildMenuTemplate();
      this.menu = Menu.buildFromTemplate(template);
      
      // 设置为应用菜单
      Menu.setApplicationMenu(this.menu);
      
      console.log('Application menu created successfully');
      return this.menu;
    } catch (error) {
      console.error('Failed to create application menu:', error);
      throw error;
    }
  }

  /**
   * 更新菜单
   */
  updateMenu(): void {
    try {
      this.createMenu();
    } catch (error) {
      console.error('Failed to update menu:', error);
    }
  }

  /**
   * 获取菜单实例
   */
  getMenu(): Menu | null {
    return this.menu;
  }

  /**
   * 构建菜单模板
   */
  private buildMenuTemplate(): Electron.MenuItemConstructorOptions[] {
    const isMac = process.platform === 'darwin';

    const template: Electron.MenuItemConstructorOptions[] = [
      // macOS 应用菜单
      ...(isMac ? [{
        label: this.config.appName,
        submenu: [
          { role: 'about' as const },
          { type: 'separator' as const },
          {
            label: '偏好设置...',
            accelerator: 'Cmd+,',
            click: () => this.openSettings(),
          },
          { type: 'separator' as const },
          { role: 'services' as const },
          { type: 'separator' as const },
          { role: 'hide' as const },
          { role: 'hideOthers' as const },
          { role: 'unhide' as const },
          { type: 'separator' as const },
          { role: 'quit' as const },
        ],
      }] : []),

      // 文件菜单
      {
        label: '文件',
        submenu: [
          {
            label: '刷新天气',
            accelerator: 'CmdOrCtrl+R',
            click: () => this.refreshWeather(),
          },
          {
            label: '更改位置',
            accelerator: 'CmdOrCtrl+L',
            click: () => this.changeLocation(),
          },
          { type: 'separator' },
          ...(isMac ? [] : [{
            label: '设置',
            accelerator: 'CmdOrCtrl+,',
            click: () => this.openSettings(),
          }]),
          { type: 'separator' },
          ...(isMac ? [] : [{ role: 'quit' as const }]),
        ],
      },

      // 编辑菜单
      {
        label: '编辑',
        submenu: [
          { role: 'undo' as const },
          { role: 'redo' as const },
          { type: 'separator' },
          { role: 'cut' as const },
          { role: 'copy' as const },
          { role: 'paste' as const },
          ...(isMac ? [
            { role: 'pasteAndMatchStyle' as const },
            { role: 'delete' as const },
            { role: 'selectAll' as const },
            { type: 'separator' as const },
            {
              label: '语音',
              submenu: [
                { role: 'startSpeaking' as const },
                { role: 'stopSpeaking' as const },
              ],
            },
          ] : [
            { role: 'delete' as const },
            { type: 'separator' as const },
            { role: 'selectAll' as const },
          ]),
        ],
      },

      // 视图菜单
      {
        label: '视图',
        submenu: [
          { role: 'reload' as const },
          { role: 'forceReload' as const },
          ...(this.config.enableDevTools ? [{ role: 'toggleDevTools' as const }] : []),
          { type: 'separator' },
          { role: 'resetZoom' as const },
          { role: 'zoomIn' as const },
          { role: 'zoomOut' as const },
          { type: 'separator' },
          { role: 'togglefullscreen' as const },
        ],
      },

      // 窗口菜单
      {
        label: '窗口',
        submenu: [
          { role: 'minimize' as const },
          { role: 'close' as const },
          ...(isMac ? [
            { type: 'separator' as const },
            { role: 'front' as const },
            { type: 'separator' as const },
            { role: 'window' as const },
          ] : []),
          { type: 'separator' },
          {
            label: '始终置顶',
            type: 'checkbox',
            checked: false,
            click: (menuItem) => this.toggleAlwaysOnTop(menuItem),
          },
          {
            label: '居中窗口',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => this.centerWindow(),
          },
        ],
      },

      // 帮助菜单
      {
        label: '帮助',
        submenu: [
          {
            label: '学习更多',
            click: () => this.openExternalLink('https://github.com/your-repo/weatherduck'),
          },
          {
            label: '报告问题',
            click: () => this.openExternalLink('https://github.com/your-repo/weatherduck/issues'),
          },
          { type: 'separator' },
          ...(this.config.enableAutoUpdater ? [{
            label: '检查更新',
            click: () => this.checkForUpdates(),
          }] : []),
          { type: 'separator' },
          ...(isMac ? [] : [{
            label: '关于',
            click: () => this.showAbout(),
          }]),
        ],
      },
    ];

    return template;
  }

  /**
   * 刷新天气
   */
  private refreshWeather(): void {
    if (this.window && !this.window.isDestroyed()) {
      try {
        this.window.webContents.send('refresh-weather');
      } catch (error) {
        console.error('Failed to refresh weather:', error);
      }
    }
  }

  /**
   * 更改位置
   */
  private changeLocation(): void {
    if (this.window && !this.window.isDestroyed()) {
      try {
        this.window.webContents.send('change-location');
      } catch (error) {
        console.error('Failed to change location:', error);
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
      } catch (error) {
        console.error('Failed to open settings:', error);
      }
    }
  }

  /**
   * 切换始终置顶
   */
  private toggleAlwaysOnTop(menuItem: MenuItem): void {
    if (this.window && !this.window.isDestroyed()) {
      try {
        const isAlwaysOnTop = menuItem.checked;
        this.window.setAlwaysOnTop(isAlwaysOnTop);
      } catch (error) {
        console.error('Failed to toggle always on top:', error);
      }
    }
  }

  /**
   * 居中窗口
   */
  private centerWindow(): void {
    if (this.window && !this.window.isDestroyed()) {
      try {
        this.window.center();
      } catch (error) {
        console.error('Failed to center window:', error);
      }
    }
  }

  /**
   * 打开外部链接
   */
  private openExternalLink(url: string): void {
    try {
      shell.openExternal(url);
    } catch (error) {
      console.error('Failed to open external link:', error);
    }
  }

  /**
   * 检查更新
   */
  private checkForUpdates(): void {
    if (this.window && !this.window.isDestroyed()) {
      try {
        this.window.webContents.send('check-updates');
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }
  }

  /**
   * 显示关于对话框
   */
  private showAbout(): void {
    try {
      dialog.showMessageBox({
        type: 'info',
        title: '关于',
        message: this.config.appName || 'WeatherDuck',
        detail: `版本 ${this.config.appVersion}\n\n一个优雅的天气应用程序`,
        buttons: ['确定'],
        defaultId: 0,
      });
    } catch (error) {
      console.error('Failed to show about dialog:', error);
    }
  }

  /**
   * 创建上下文菜单
   */
  createContextMenu(): Menu {
    try {
      const template: Electron.MenuItemConstructorOptions[] = [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: '刷新天气',
          click: () => this.refreshWeather(),
        },
        {
          label: '打开设置',
          click: () => this.openSettings(),
        },
      ];

      return Menu.buildFromTemplate(template);
    } catch (error) {
      console.error('Failed to create context menu:', error);
      throw error;
    }
  }

  /**
   * 绑定窗口右键菜单
   */
  bindContextMenu(): void {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }

    try {
      this.window.webContents.on('context-menu', (event, params) => {
        const contextMenu = this.createContextMenu();
        contextMenu.popup({ window: this.window! });
      });
    } catch (error) {
      console.error('Failed to bind context menu:', error);
    }
  }

  /**
   * 处理快捷键
   */
  registerGlobalShortcuts(): void {
    // 这里可以注册全局快捷键
    // 注意：需要在主进程中使用 globalShortcut 模块
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.window = null;
    this.menu = null;
  }
}