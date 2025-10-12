import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import * as path from 'path';
import { WeatherService } from '../shared/services/WeatherService';
import { DatabaseService } from '../shared/services/DatabaseService';

// 保持对窗口对象的全局引用，如果不这样做，当JavaScript对象被垃圾回收时，窗口将自动关闭
let mainWindow: BrowserWindow | null = null;

// 服务实例
let weatherService: WeatherService;
let databaseService: DatabaseService;

const isDev = process.env.NODE_ENV === 'development';

function createWindow(): void {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 350,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'hiddenInset',
    show: false, // 先不显示，等待ready-to-show事件
  });

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 当窗口准备好显示时
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      
      // 在开发环境下聚焦窗口
      if (isDev) {
        mainWindow.focus();
      }
    }
  });

  // 当窗口关闭时
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(async () => {
  // 初始化服务
  databaseService = new DatabaseService();
  await databaseService.initialize();
  
  weatherService = new WeatherService();

  createWindow();

  // 设置应用菜单
  createMenu();

  app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，通常会在应用程序中重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，应用程序及其菜单栏通常保持活动状态，直到用户使用Cmd + Q明确退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 在此文件中，您可以包含应用程序特定的主进程代码的其余部分
// 您也可以将它们放在单独的文件中并在此处require它们

// IPC处理程序
ipcMain.handle('get-weather', async (event, cityName: string) => {
  try {
    return await weatherService.getCurrentWeather(cityName);
  } catch (error) {
    console.error('获取天气数据失败:', error);
    throw error;
  }
});

ipcMain.handle('get-forecast', async (event, cityName: string) => {
  try {
    return await weatherService.getForecast(cityName);
  } catch (error) {
    console.error('获取天气预报失败:', error);
    throw error;
  }
});

ipcMain.handle('search-cities', async (event, query: string) => {
  try {
    return await weatherService.searchCities(query);
  } catch (error) {
    console.error('搜索城市失败:', error);
    throw error;
  }
});

ipcMain.handle('save-favorite-city', async (event, cityData: any) => {
  try {
    return await databaseService.saveFavoriteCity(cityData);
  } catch (error) {
    console.error('保存收藏城市失败:', error);
    throw error;
  }
});

ipcMain.handle('get-favorite-cities', async () => {
  try {
    return await databaseService.getFavoriteCities();
  } catch (error) {
    console.error('获取收藏城市失败:', error);
    throw error;
  }
});

ipcMain.handle('get-settings', async () => {
  try {
    return await databaseService.getSettings();
  } catch (error) {
    console.error('获取设置失败:', error);
    throw error;
  }
});

ipcMain.handle('save-settings', async (event, settings: any) => {
  try {
    return await databaseService.saveSettings(settings);
  } catch (error) {
    console.error('保存设置失败:', error);
    throw error;
  }
});

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '切换开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '切换全屏', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于天气鸭',
          click: () => {
            // 显示关于对话框
            if (mainWindow) {
              mainWindow.webContents.send('show-about');
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}