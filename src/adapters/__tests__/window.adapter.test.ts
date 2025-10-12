import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IWindowAdapter, WindowAdapterFactory, WindowOptions, WindowState, WindowPosition, WindowSize } from '../types';

describe('WindowAdapter', () => {
  let windowAdapter: IWindowAdapter;
  
  beforeEach(async () => {
    windowAdapter = await WindowAdapterFactory.create();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('窗口基本操作', () => {
    it('应该能够获取当前窗口状态', async () => {
      const state = await windowAdapter.getState();
      expect(['normal', 'minimized', 'maximized', 'fullscreen', 'hidden']).toContain(state);
    });

    it('应该能够最小化窗口', async () => {
      await windowAdapter.minimize();
      
      const state = await windowAdapter.getState();
      expect(state).toBe('minimized');
    });

    it('应该能够最大化窗口', async () => {
      await windowAdapter.maximize();
      
      const state = await windowAdapter.getState();
      expect(state).toBe('maximized');
    });

    it('应该能够恢复窗口', async () => {
      await windowAdapter.minimize();
      await windowAdapter.restore();
      
      const state = await windowAdapter.getState();
      expect(state).toBe('normal');
    });

    it('应该能够隐藏窗口', async () => {
      await windowAdapter.hide();
      
      const state = await windowAdapter.getState();
      expect(state).toBe('hidden');
    });

    it('应该能够显示窗口', async () => {
      await windowAdapter.hide();
      await windowAdapter.show();
      
      const state = await windowAdapter.getState();
      expect(['normal', 'maximized']).toContain(state);
    });

    it('应该能够关闭窗口', async () => {
      const closePromise = windowAdapter.close();
      
      // 验证关闭事件被触发
      await expect(closePromise).resolves.not.toThrow();
    });
  });

  describe('窗口位置和大小', () => {
    it('应该能够获取窗口位置', async () => {
      const position = await windowAdapter.getPosition();
      
      expect(position).toBeDefined();
      expect(typeof position.x).toBe('number');
      expect(typeof position.y).toBe('number');
    });

    it('应该能够设置窗口位置', async () => {
      const newPosition: WindowPosition = { x: 100, y: 200 };
      
      await windowAdapter.setPosition(newPosition);
      
      const position = await windowAdapter.getPosition();
      expect(position.x).toBeCloseTo(newPosition.x, 0);
      expect(position.y).toBeCloseTo(newPosition.y, 0);
    });

    it('应该能够获取窗口大小', async () => {
      const size = await windowAdapter.getSize();
      
      expect(size).toBeDefined();
      expect(size.width).toBeGreaterThan(0);
      expect(size.height).toBeGreaterThan(0);
    });

    it('应该能够设置窗口大小', async () => {
      const newSize: WindowSize = { width: 800, height: 600 };
      
      await windowAdapter.setSize(newSize);
      
      const size = await windowAdapter.getSize();
      expect(size.width).toBeCloseTo(newSize.width, 0);
      expect(size.height).toBeCloseTo(newSize.height, 0);
    });

    it('应该能够同时设置位置和大小', async () => {
      const bounds = {
        x: 150,
        y: 250,
        width: 900,
        height: 700
      };
      
      await windowAdapter.setBounds(bounds);
      
      const position = await windowAdapter.getPosition();
      const size = await windowAdapter.getSize();
      
      expect(position.x).toBeCloseTo(bounds.x, 0);
      expect(position.y).toBeCloseTo(bounds.y, 0);
      expect(size.width).toBeCloseTo(bounds.width, 0);
      expect(size.height).toBeCloseTo(bounds.height, 0);
    });

    it('应该能够居中窗口', async () => {
      await windowAdapter.center();
      
      const position = await windowAdapter.getPosition();
      const size = await windowAdapter.getSize();
      const screenSize = await windowAdapter.getScreenSize();
      
      const expectedX = (screenSize.width - size.width) / 2;
      const expectedY = (screenSize.height - size.height) / 2;
      
      expect(position.x).toBeCloseTo(expectedX, 10);
      expect(position.y).toBeCloseTo(expectedY, 10);
    });
  });

  describe('窗口属性设置', () => {
    it('应该能够设置窗口标题', async () => {
      const title = 'Weather Duck - Test Title';
      
      await windowAdapter.setTitle(title);
      
      const currentTitle = await windowAdapter.getTitle();
      expect(currentTitle).toBe(title);
    });

    it('应该能够设置窗口图标', async () => {
      const iconPath = '/assets/icons/app-icon.png';
      
      await windowAdapter.setIcon(iconPath);
      
      // 验证图标设置成功（具体验证方式取决于平台）
      const currentIcon = await windowAdapter.getIcon();
      expect(currentIcon).toBe(iconPath);
    });

    it('应该能够设置窗口透明度', async () => {
      const opacity = 0.8;
      
      await windowAdapter.setOpacity(opacity);
      
      const currentOpacity = await windowAdapter.getOpacity();
      expect(currentOpacity).toBeCloseTo(opacity, 2);
    });

    it('应该能够设置窗口置顶', async () => {
      await windowAdapter.setAlwaysOnTop(true);
      
      const isAlwaysOnTop = await windowAdapter.isAlwaysOnTop();
      expect(isAlwaysOnTop).toBe(true);
      
      await windowAdapter.setAlwaysOnTop(false);
      
      const isNotAlwaysOnTop = await windowAdapter.isAlwaysOnTop();
      expect(isNotAlwaysOnTop).toBe(false);
    });

    it('应该能够设置窗口可调整大小', async () => {
      await windowAdapter.setResizable(false);
      
      const isResizable = await windowAdapter.isResizable();
      expect(isResizable).toBe(false);
      
      await windowAdapter.setResizable(true);
      
      const isResizableAgain = await windowAdapter.isResizable();
      expect(isResizableAgain).toBe(true);
    });

    it('应该能够设置窗口最小大小', async () => {
      const minSize: WindowSize = { width: 400, height: 300 };
      
      await windowAdapter.setMinimumSize(minSize);
      
      const currentMinSize = await windowAdapter.getMinimumSize();
      expect(currentMinSize.width).toBe(minSize.width);
      expect(currentMinSize.height).toBe(minSize.height);
    });

    it('应该能够设置窗口最大大小', async () => {
      const maxSize: WindowSize = { width: 1920, height: 1080 };
      
      await windowAdapter.setMaximumSize(maxSize);
      
      const currentMaxSize = await windowAdapter.getMaximumSize();
      expect(currentMaxSize.width).toBe(maxSize.width);
      expect(currentMaxSize.height).toBe(maxSize.height);
    });
  });

  describe('全屏和焦点管理', () => {
    it('应该能够进入全屏模式', async () => {
      await windowAdapter.setFullScreen(true);
      
      const state = await windowAdapter.getState();
      expect(state).toBe('fullscreen');
    });

    it('应该能够退出全屏模式', async () => {
      await windowAdapter.setFullScreen(true);
      await windowAdapter.setFullScreen(false);
      
      const state = await windowAdapter.getState();
      expect(state).not.toBe('fullscreen');
    });

    it('应该能够检查是否为全屏状态', async () => {
      let isFullScreen = await windowAdapter.isFullScreen();
      expect(typeof isFullScreen).toBe('boolean');
      
      await windowAdapter.setFullScreen(true);
      isFullScreen = await windowAdapter.isFullScreen();
      expect(isFullScreen).toBe(true);
    });

    it('应该能够聚焦窗口', async () => {
      await windowAdapter.focus();
      
      const isFocused = await windowAdapter.isFocused();
      expect(isFocused).toBe(true);
    });

    it('应该能够失去焦点', async () => {
      await windowAdapter.blur();
      
      const isFocused = await windowAdapter.isFocused();
      expect(isFocused).toBe(false);
    });

    it('应该能够检查窗口是否可见', async () => {
      let isVisible = await windowAdapter.isVisible();
      expect(typeof isVisible).toBe('boolean');
      
      await windowAdapter.hide();
      isVisible = await windowAdapter.isVisible();
      expect(isVisible).toBe(false);
      
      await windowAdapter.show();
      isVisible = await windowAdapter.isVisible();
      expect(isVisible).toBe(true);
    });
  });

  describe('窗口事件处理', () => {
    it('应该能够监听窗口关闭事件', async () => {
      const closeHandler = vi.fn();
      
      windowAdapter.on('close', closeHandler);
      
      // 模拟窗口关闭
      await windowAdapter.close();
      
      expect(closeHandler).toHaveBeenCalled();
    });

    it('应该能够监听窗口大小变化事件', async () => {
      const resizeHandler = vi.fn();
      
      windowAdapter.on('resize', resizeHandler);
      
      const newSize: WindowSize = { width: 800, height: 600 };
      await windowAdapter.setSize(newSize);
      
      expect(resizeHandler).toHaveBeenCalledWith(newSize);
    });

    it('应该能够监听窗口移动事件', async () => {
      const moveHandler = vi.fn();
      
      windowAdapter.on('move', moveHandler);
      
      const newPosition: WindowPosition = { x: 100, y: 200 };
      await windowAdapter.setPosition(newPosition);
      
      expect(moveHandler).toHaveBeenCalledWith(newPosition);
    });

    it('应该能够监听窗口状态变化事件', async () => {
      const stateChangeHandler = vi.fn();
      
      windowAdapter.on('state-change', stateChangeHandler);
      
      await windowAdapter.minimize();
      
      expect(stateChangeHandler).toHaveBeenCalledWith('minimized');
    });

    it('应该能够监听焦点变化事件', async () => {
      const focusHandler = vi.fn();
      const blurHandler = vi.fn();
      
      windowAdapter.on('focus', focusHandler);
      windowAdapter.on('blur', blurHandler);
      
      await windowAdapter.focus();
      expect(focusHandler).toHaveBeenCalled();
      
      await windowAdapter.blur();
      expect(blurHandler).toHaveBeenCalled();
    });

    it('应该能够移除事件监听器', async () => {
      const closeHandler = vi.fn();
      
      windowAdapter.on('close', closeHandler);
      windowAdapter.off('close', closeHandler);
      
      await windowAdapter.close();
      
      expect(closeHandler).not.toHaveBeenCalled();
    });
  });

  describe('屏幕和显示器信息', () => {
    it('应该能够获取屏幕大小', async () => {
      const screenSize = await windowAdapter.getScreenSize();
      
      expect(screenSize.width).toBeGreaterThan(0);
      expect(screenSize.height).toBeGreaterThan(0);
    });

    it('应该能够获取工作区大小', async () => {
      const workAreaSize = await windowAdapter.getWorkAreaSize();
      
      expect(workAreaSize.width).toBeGreaterThan(0);
      expect(workAreaSize.height).toBeGreaterThan(0);
    });

    it('应该能够获取显示器列表', async () => {
      const displays = await windowAdapter.getDisplays();
      
      expect(Array.isArray(displays)).toBe(true);
      expect(displays.length).toBeGreaterThan(0);
      
      displays.forEach(display => {
        expect(display.id).toBeDefined();
        expect(display.bounds).toBeDefined();
        expect(display.workArea).toBeDefined();
        expect(typeof display.scaleFactor).toBe('number');
      });
    });

    it('应该能够获取主显示器', async () => {
      const primaryDisplay = await windowAdapter.getPrimaryDisplay();
      
      expect(primaryDisplay).toBeDefined();
      expect(primaryDisplay.id).toBeDefined();
      expect(primaryDisplay.bounds).toBeDefined();
    });

    it('应该能够获取当前显示器', async () => {
      const currentDisplay = await windowAdapter.getCurrentDisplay();
      
      expect(currentDisplay).toBeDefined();
      expect(currentDisplay.id).toBeDefined();
    });
  });

  describe('窗口创建和管理', () => {
    it('应该能够创建新窗口', async () => {
      const options: WindowOptions = {
        width: 600,
        height: 400,
        title: 'New Window',
        resizable: true,
        minimizable: true,
        maximizable: true
      };
      
      const newWindowId = await windowAdapter.createWindow(options);
      
      expect(newWindowId).toBeDefined();
      expect(typeof newWindowId).toBe('string');
    });

    it('应该能够获取所有窗口', async () => {
      const windows = await windowAdapter.getAllWindows();
      
      expect(Array.isArray(windows)).toBe(true);
      expect(windows.length).toBeGreaterThan(0);
    });

    it('应该能够获取活动窗口', async () => {
      const activeWindow = await windowAdapter.getActiveWindow();
      
      expect(activeWindow).toBeDefined();
      expect(activeWindow.id).toBeDefined();
    });

    it('应该能够切换到指定窗口', async () => {
      const options: WindowOptions = {
        width: 400,
        height: 300,
        title: 'Switch Test Window'
      };
      
      const newWindowId = await windowAdapter.createWindow(options);
      await windowAdapter.switchToWindow(newWindowId);
      
      const activeWindow = await windowAdapter.getActiveWindow();
      expect(activeWindow.id).toBe(newWindowId);
    });
  });

  describe('窗口快照和截图', () => {
    it('应该能够截取窗口截图', async () => {
      const screenshot = await windowAdapter.captureWindow();
      
      expect(screenshot).toBeDefined();
      expect(screenshot.data).toBeDefined();
      expect(screenshot.width).toBeGreaterThan(0);
      expect(screenshot.height).toBeGreaterThan(0);
    });

    it('应该能够截取指定区域', async () => {
      const region = {
        x: 0,
        y: 0,
        width: 200,
        height: 150
      };
      
      const screenshot = await windowAdapter.captureRegion(region);
      
      expect(screenshot).toBeDefined();
      expect(screenshot.width).toBe(region.width);
      expect(screenshot.height).toBe(region.height);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的窗口大小', async () => {
      const invalidSize: WindowSize = { width: -100, height: -50 };
      
      await expect(windowAdapter.setSize(invalidSize)).rejects.toThrow();
    });

    it('应该处理无效的窗口位置', async () => {
      const invalidPosition: WindowPosition = { x: NaN, y: Infinity };
      
      await expect(windowAdapter.setPosition(invalidPosition)).rejects.toThrow();
    });

    it('应该处理无效的透明度值', async () => {
      await expect(windowAdapter.setOpacity(-0.5)).rejects.toThrow();
      await expect(windowAdapter.setOpacity(1.5)).rejects.toThrow();
    });

    it('应该处理不存在的窗口ID', async () => {
      await expect(windowAdapter.switchToWindow('non-existent-id')).rejects.toThrow();
    });
  });

  describe('平台特定功能', () => {
    it('应该提供平台信息', () => {
      expect(windowAdapter.platform).toBeDefined();
      expect(['desktop', 'web']).toContain(windowAdapter.platform);
    });

    it('应该提供窗口管理能力信息', () => {
      const capabilities = windowAdapter.getCapabilities();
      
      expect(capabilities).toBeDefined();
      expect(typeof capabilities.supportsMultipleWindows).toBe('boolean');
      expect(typeof capabilities.supportsTransparency).toBe('boolean');
      expect(typeof capabilities.supportsAlwaysOnTop).toBe('boolean');
      expect(typeof capabilities.supportsFullscreen).toBe('boolean');
    });
  });
});

// 桌面版特定测试 (Electron)
describe('DesktopWindowAdapter (Electron)', () => {
  let adapter: IWindowAdapter;
  
  beforeEach(async () => {
    // 模拟Electron环境
    vi.stubGlobal('process', { platform: 'win32' });
    vi.stubGlobal('window', undefined);
    
    adapter = await WindowAdapterFactory.create();
  });

  it('应该使用Electron窗口管理', () => {
    expect(adapter.platform).toBe('desktop');
  });

  it('应该支持原生窗口装饰', async () => {
    const options: WindowOptions = {
      width: 800,
      height: 600,
      frame: false,
      titleBarStyle: 'hidden'
    };
    
    const windowId = await adapter.createWindow(options);
    expect(windowId).toBeDefined();
  });

  it('应该支持窗口阴影', async () => {
    await adapter.setHasShadow(true);
    
    const hasShadow = await adapter.getHasShadow();
    expect(hasShadow).toBe(true);
  });

  it('应该支持窗口振动效果', async () => {
    await adapter.setVibrancy('dark');
    
    const vibrancy = await adapter.getVibrancy();
    expect(vibrancy).toBe('dark');
  });

  it('应该支持任务栏进度', async () => {
    await adapter.setProgressBar(0.5);
    
    const progress = await adapter.getProgressBar();
    expect(progress).toBeCloseTo(0.5, 2);
  });

  it('应该支持系统托盘', async () => {
    await adapter.setTrayIcon('/assets/icons/tray.png');
    
    const hasTray = await adapter.hasTrayIcon();
    expect(hasTray).toBe(true);
  });
});

// Web版特定测试 (PWA)
describe('WebWindowAdapter (PWA)', () => {
  let adapter: IWindowAdapter;
  
  beforeEach(async () => {
    // 模拟Web环境
    const mockWindow = {
      innerWidth: 1024,
      innerHeight: 768,
      outerWidth: 1024,
      outerHeight: 768,
      screenX: 100,
      screenY: 100,
      moveTo: vi.fn(),
      resizeTo: vi.fn(),
      focus: vi.fn(),
      blur: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    vi.stubGlobal('window', mockWindow);
    vi.stubGlobal('process', undefined);
    
    adapter = await WindowAdapterFactory.create();
  });

  it('应该使用Web窗口API', () => {
    expect(adapter.platform).toBe('web');
  });

  it('应该支持PWA安装检测', async () => {
    const isInstallable = await adapter.isInstallable();
    expect(typeof isInstallable).toBe('boolean');
  });

  it('应该支持PWA安装提示', async () => {
    // 模拟beforeinstallprompt事件
    const mockEvent = {
      prompt: vi.fn().mockResolvedValue({ outcome: 'accepted' }),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    };
    
    vi.stubGlobal('beforeinstallprompt', mockEvent);
    
    const result = await adapter.promptInstall();
    expect(result.outcome).toBe('accepted');
  });

  it('应该支持全屏API', async () => {
    const mockDocument = {
      documentElement: {
        requestFullscreen: vi.fn().mockResolvedValue(undefined)
      },
      exitFullscreen: vi.fn().mockResolvedValue(undefined),
      fullscreenElement: null
    };
    
    vi.stubGlobal('document', mockDocument);
    
    await adapter.setFullScreen(true);
    expect(mockDocument.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it('应该支持页面可见性API', async () => {
    const mockDocument = {
      hidden: false,
      visibilityState: 'visible',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    vi.stubGlobal('document', mockDocument);
    
    const isVisible = await adapter.isVisible();
    expect(isVisible).toBe(true);
  });

  it('应该处理浏览器限制', async () => {
    // 测试在受限环境下的行为
    const capabilities = adapter.getCapabilities();
    
    expect(capabilities.supportsMultipleWindows).toBe(false);
    expect(capabilities.supportsAlwaysOnTop).toBe(false);
    expect(capabilities.supportsTransparency).toBe(false);
  });
});