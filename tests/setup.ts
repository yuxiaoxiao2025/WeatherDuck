import { jest } from '@jest/globals';

// Mock electron with proper typing
const mockElectron = {
  app: {
    getVersion: jest.fn(() => '1.0.0'),
    getName: jest.fn(() => 'WeatherDuck'),
    getPath: jest.fn((name: string) => {
      const paths: Record<string, string> = {
        userData: '/mock/userData',
        appData: '/mock/appData',
        temp: '/mock/temp',
        home: '/mock/home',
        documents: '/mock/documents',
        downloads: '/mock/downloads',
        desktop: '/mock/desktop',
      };
      return paths[name] || '/mock/default';
    }),
    quit: jest.fn(),
    whenReady: jest.fn<() => Promise<void>>().mockResolvedValue(void 0),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    isReady: jest.fn(() => true),
    focus: jest.fn(),
    hide: jest.fn(),
    show: jest.fn(),
    setAppUserModelId: jest.fn(),
    requestSingleInstanceLock: jest.fn(() => true),
    releaseSingleInstanceLock: jest.fn(),
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn<() => Promise<void>>().mockResolvedValue(void 0),
    loadFile: jest.fn<() => Promise<void>>().mockResolvedValue(void 0),
    show: jest.fn(),
    hide: jest.fn(),
    close: jest.fn(),
    focus: jest.fn(),
    blur: jest.fn(),
    minimize: jest.fn(),
    maximize: jest.fn(),
    unmaximize: jest.fn(),
    restore: jest.fn(),
    center: jest.fn(),
    setAlwaysOnTop: jest.fn(),
    isMaximized: jest.fn(() => false),
    isMinimized: jest.fn(() => false),
    isVisible: jest.fn(() => true),
    isFocused: jest.fn(() => true),
    getBounds: jest.fn(() => ({ x: 100, y: 100, width: 800, height: 600 })),
    setBounds: jest.fn(),
    getSize: jest.fn(() => [800, 600]),
    setSize: jest.fn(),
    getPosition: jest.fn(() => [100, 100]),
    setPosition: jest.fn(),
    setMinimumSize: jest.fn(),
    setMaximumSize: jest.fn(),
    setResizable: jest.fn(),
    isResizable: jest.fn(() => true),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    webContents: {
      send: jest.fn(),
      openDevTools: jest.fn(),
      closeDevTools: jest.fn(),
      isDevToolsOpened: jest.fn(() => false),
      setWindowOpenHandler: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    },
  })),
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    removeHandler: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  ipcRenderer: {
    invoke: jest.fn(),
    send: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  contextBridge: {
    exposeInMainWorld: jest.fn(),
  },
  shell: {
    openExternal: jest.fn<() => Promise<void>>().mockResolvedValue(void 0),
    openPath: jest.fn<() => Promise<string>>().mockResolvedValue(''),
    showItemInFolder: jest.fn(),
    moveItemToTrash: jest.fn(() => true),
    beep: jest.fn(),
  },
  dialog: {
    showMessageBox: jest.fn<() => Promise<any>>().mockResolvedValue({ response: 0, checkboxChecked: false }),
    showErrorBox: jest.fn(),
    showOpenDialog: jest.fn<() => Promise<any>>().mockResolvedValue({ canceled: false, filePaths: [] }),
    showSaveDialog: jest.fn<() => Promise<any>>().mockResolvedValue({ canceled: false, filePath: '' }),
  },
  Menu: {
    buildFromTemplate: jest.fn(() => ({
      popup: jest.fn(),
      closePopup: jest.fn(),
    })),
    setApplicationMenu: jest.fn(),
    getApplicationMenu: jest.fn(),
  },
  MenuItem: jest.fn(),
  Tray: jest.fn().mockImplementation(() => ({
    setToolTip: jest.fn(),
    setTitle: jest.fn(),
    setImage: jest.fn(),
    setContextMenu: jest.fn(),
    displayBalloon: jest.fn(),
    popUpContextMenu: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
  nativeImage: {
    createFromPath: jest.fn(() => ({
      isEmpty: jest.fn(() => false),
      getSize: jest.fn(() => ({ width: 16, height: 16 })),
    })),
    createFromBuffer: jest.fn(),
    createFromDataURL: jest.fn(),
    createEmpty: jest.fn(),
  },
  Notification: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
    close: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
  screen: {
    getPrimaryDisplay: jest.fn(() => ({
      bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      workArea: { x: 0, y: 0, width: 1920, height: 1040 },
      size: { width: 1920, height: 1080 },
      workAreaSize: { width: 1920, height: 1040 },
      scaleFactor: 1,
    })),
    getAllDisplays: jest.fn(() => []),
    getDisplayNearestPoint: jest.fn(),
    getDisplayMatching: jest.fn(),
    getCursorScreenPoint: jest.fn(() => ({ x: 0, y: 0 })),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
};

jest.mock('electron', () => mockElectron);

// Mock Node.js modules
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
    stat: jest.fn(),
  },
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  statSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
  resolve: jest.fn((...args: string[]) => args.join('/')),
  dirname: jest.fn((path: string) => path.split('/').slice(0, -1).join('/')),
  basename: jest.fn((path: string) => path.split('/').pop() || ''),
  extname: jest.fn((path: string) => {
    const parts = path.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
  }),
  sep: '/',
  delimiter: ':',
}));

// Mock electron-updater
jest.mock('electron-updater', () => ({
  autoUpdater: {
    checkForUpdatesAndNotify: jest.fn(),
    checkForUpdates: jest.fn(),
    downloadUpdate: jest.fn(),
    quitAndInstall: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
}));

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

// Global error handler for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.VITE_PUBLIC = '/mock/public';

// Export common test utilities
export const createMockWindow = () => {
  return new mockElectron.BrowserWindow();
};

export const createMockTray = () => {
  return new mockElectron.Tray();
};