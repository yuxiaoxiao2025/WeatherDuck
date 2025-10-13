import { jest } from '@jest/globals';

// Mock Electron modules
jest.mock('electron', () => ({
  app: {
    getName: jest.fn(() => '天气鸭'),
    getVersion: jest.fn(() => '1.0.0'),
    getPath: jest.fn((name: string) => `/mock/path/${name}`),
    whenReady: jest.fn(() => Promise.resolve()),
    quit: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    removeAllListeners: jest.fn(),
    requestSingleInstanceLock: jest.fn(() => true),
    focus: jest.fn(),
    isReady: jest.fn(() => true),
    dock: {
      hide: jest.fn(),
      show: jest.fn(),
    },
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
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
    isMinimized: jest.fn(() => false),
    isMaximized: jest.fn(() => false),
    isFullScreen: jest.fn(() => false),
  })),
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeHandler: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  Menu: {
    setApplicationMenu: jest.fn(),
    buildFromTemplate: jest.fn(() => ({})),
  },
  Tray: jest.fn().mockImplementation(() => ({
    setToolTip: jest.fn(),
    setContextMenu: jest.fn(),
    on: jest.fn(),
    destroy: jest.fn(),
  })),
  shell: {
    openExternal: jest.fn(() => Promise.resolve()),
  },
  dialog: {
    showMessageBox: jest.fn(() => Promise.resolve({ response: 0 })),
    showErrorBox: jest.fn(),
  },
  nativeImage: {
    createFromPath: jest.fn(() => ({})),
  },
}));

// Mock Node.js modules
jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
  resolve: jest.fn((...args: string[]) => args.join('/')),
  dirname: jest.fn((path: string) => path.split('/').slice(0, -1).join('/')),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(() => '{}'),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});