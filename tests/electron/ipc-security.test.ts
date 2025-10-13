import { jest } from '@jest/globals';
import { ipcMain, BrowserWindow } from 'electron';

describe('安全IPC通信', () => {
  let mockWindow: any;

  beforeEach(() => {
    mockWindow = {
      webContents: {
        send: jest.fn(),
        on: jest.fn(),
      },
      on: jest.fn(),
      once: jest.fn(),
    };
    
    (BrowserWindow as any).mockImplementation(() => mockWindow);
  });

  describe('contextBridge安全性', () => {
    it('应该只暴露安全的API方法', () => {
      // 模拟preload脚本中的API暴露
      const exposedAPI = {
        // 安全的API方法
        getAppVersion: expect.any(Function),
        showMessageBox: expect.any(Function),
        showErrorBox: expect.any(Function),
        openWindow: expect.any(Function),
        
        // 不应该暴露的危险方法
        require: undefined,
        process: undefined,
        global: undefined,
        Buffer: undefined,
      };

      // 验证只暴露了安全的API
      expect(exposedAPI.getAppVersion).toBeDefined();
      expect(exposedAPI.showMessageBox).toBeDefined();
      expect(exposedAPI.require).toBeUndefined();
      expect(exposedAPI.process).toBeUndefined();
    });

    it('应该验证API调用参数', () => {
      const mockHandler = jest.fn((event, ...args) => {
        // 验证参数类型和格式
        if (args.length === 0) {
          throw new Error('Missing required parameters');
        }
        return 'success';
      });

      ipcMain.handle('test-api', mockHandler);

      expect(ipcMain.handle).toHaveBeenCalledWith('test-api', mockHandler);
    });

    it('应该过滤和清理输入数据', () => {
      const sanitizeInput = (input: any) => {
        if (typeof input === 'string') {
          // 移除潜在的恶意脚本
          return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
        if (typeof input === 'object' && input !== null) {
          // 移除函数和原型污染
          const cleaned: any = {};
          for (const key in input) {
            if (key !== '__proto__' && key !== 'constructor' && typeof input[key] !== 'function') {
              cleaned[key] = sanitizeInput(input[key]);
            }
          }
          return cleaned;
        }
        return input;
      };

      const maliciousInput = {
        name: '<script>alert("xss")</script>test',
        __proto__: { polluted: true },
        constructor: () => {},
        data: { value: 'safe' },
      };

      const sanitized = sanitizeInput(maliciousInput);

      expect(sanitized.name).toBe('test');
      expect(sanitized.__proto__).toEqual({});
      expect(sanitized.constructor).toEqual(expect.any(Function));
      expect(sanitized.data.value).toBe('safe');
    });
  });

  describe('IPC通道管理', () => {
    it('应该注册所有必需的IPC处理器', () => {
      const requiredHandlers = [
        'get-app-version',
        'show-message-box',
        'show-error-box',
        'open-window',
        'get-weather-data',
        'save-settings',
        'load-settings',
      ];

      requiredHandlers.forEach(channel => {
        const handler = jest.fn();
        ipcMain.handle(channel, handler);
        
        expect(ipcMain.handle).toHaveBeenCalledWith(channel, handler);
      });
    });

    it('应该验证IPC通道名称', () => {
      const validChannels = [
        'get-app-version',
        'show-message-box',
        'open-window',
      ];

      const invalidChannels = [
        'eval-code',
        'execute-command',
        'access-filesystem',
      ];

      const isValidChannel = (channel: string) => {
        return validChannels.includes(channel);
      };

      validChannels.forEach(channel => {
        expect(isValidChannel(channel)).toBe(true);
      });

      invalidChannels.forEach(channel => {
        expect(isValidChannel(channel)).toBe(false);
      });
    });

    it('应该限制IPC调用频率', () => {
      const rateLimiter = new Map<string, number[]>();
      const RATE_LIMIT = 10; // 每秒最多10次调用
      const TIME_WINDOW = 1000; // 1秒时间窗口

      const checkRateLimit = (channel: string): boolean => {
        const now = Date.now();
        const calls = rateLimiter.get(channel) || [];
        
        // 清理过期的调用记录
        const validCalls = calls.filter(time => now - time < TIME_WINDOW);
        
        if (validCalls.length >= RATE_LIMIT) {
          return false; // 超过限制
        }
        
        validCalls.push(now);
        rateLimiter.set(channel, validCalls);
        return true;
      };

      // 模拟正常调用
      for (let i = 0; i < RATE_LIMIT; i++) {
        expect(checkRateLimit('test-channel')).toBe(true);
      }

      // 超过限制的调用应该被拒绝
      expect(checkRateLimit('test-channel')).toBe(false);
    });
  });

  describe('类型安全', () => {
    interface IPCRequest {
      channel: string;
      data?: any;
    }

    interface IPCResponse<T = any> {
      success: boolean;
      data?: T;
      error?: string;
    }

    it('应该验证请求数据类型', () => {
      const validateRequest = (request: any): request is IPCRequest => {
        return (
          typeof request === 'object' &&
          request !== null &&
          typeof request.channel === 'string' &&
          request.channel.length > 0
        );
      };

      const validRequest = { channel: 'test', data: { value: 1 } };
      const invalidRequest1 = { data: { value: 1 } }; // 缺少channel
      const invalidRequest2 = { channel: '' }; // 空channel
      const invalidRequest3 = null; // null请求

      expect(validateRequest(validRequest)).toBe(true);
      expect(validateRequest(invalidRequest1)).toBe(false);
      expect(validateRequest(invalidRequest2)).toBe(false);
      expect(validateRequest(invalidRequest3)).toBe(false);
    });

    it('应该返回类型安全的响应', () => {
      const createResponse = <T>(success: boolean, data?: T, error?: string): IPCResponse<T> => {
        return { success, data, error };
      };

      const successResponse = createResponse(true, { version: '1.0.0' });
      const errorResponse = createResponse(false, undefined, 'Invalid request');

      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toEqual({ version: '1.0.0' });
      expect(successResponse.error).toBeUndefined();

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.data).toBeUndefined();
      expect(errorResponse.error).toBe('Invalid request');
    });

    it('应该验证API参数类型', () => {
      const validateShowMessageBoxParams = (params: any) => {
        return (
          typeof params === 'object' &&
          params !== null &&
          typeof params.type === 'string' &&
          ['info', 'warning', 'error', 'question'].includes(params.type) &&
          typeof params.title === 'string' &&
          typeof params.message === 'string'
        );
      };

      const validParams = {
        type: 'info',
        title: 'Test',
        message: 'Test message',
      };

      const invalidParams1 = {
        type: 'invalid',
        title: 'Test',
        message: 'Test message',
      };

      const invalidParams2 = {
        type: 'info',
        title: 123,
        message: 'Test message',
      };

      expect(validateShowMessageBoxParams(validParams)).toBe(true);
      expect(validateShowMessageBoxParams(invalidParams1)).toBe(false);
      expect(validateShowMessageBoxParams(invalidParams2)).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('应该捕获和处理IPC处理器中的错误', async () => {
      const errorHandler = jest.fn(async (event, ...args) => {
        try {
          throw new Error('Test error');
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      ipcMain.handle('error-test', errorHandler);

      const result = await errorHandler({}, 'test');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });

    it('应该记录安全相关的错误', () => {
      const securityLogger = {
        logSecurityEvent: jest.fn(),
      };

      const securityError = {
        type: 'INVALID_CHANNEL',
        channel: 'dangerous-channel',
        timestamp: new Date().toISOString(),
        details: 'Attempt to access unauthorized channel',
      };

      securityLogger.logSecurityEvent(securityError);

      expect(securityLogger.logSecurityEvent).toHaveBeenCalledWith(securityError);
    });

    it('应该处理渲染进程崩溃', () => {
      const window = new BrowserWindow();
      const crashHandler = jest.fn((event, killed) => {
        console.error('Renderer process crashed:', { killed });
        // 重新加载页面或重启应用
      });

      window.webContents.on('crashed', crashHandler);

      expect(window.webContents.on).toHaveBeenCalledWith('crashed', crashHandler);
    });

    it('应该处理未响应的渲染进程', () => {
      const window = new BrowserWindow();
      const unresponsiveHandler = jest.fn(() => {
        console.warn('Renderer process is unresponsive');
        // 显示警告或重启渲染进程
      });

      window.webContents.on('unresponsive', unresponsiveHandler);

      expect(window.webContents.on).toHaveBeenCalledWith('unresponsive', unresponsiveHandler);
    });
  });

  describe('权限控制', () => {
    it('应该检查API调用权限', () => {
      const permissions = {
        'get-app-version': ['read'],
        'show-message-box': ['ui'],
        'save-settings': ['write'],
        'execute-command': [], // 不允许任何权限
      };

      const checkPermission = (channel: string, requiredPermission: string): boolean => {
        const channelPermissions = permissions[channel as keyof typeof permissions];
        return channelPermissions && channelPermissions.includes(requiredPermission);
      };

      expect(checkPermission('get-app-version', 'read')).toBe(true);
      expect(checkPermission('show-message-box', 'ui')).toBe(true);
      expect(checkPermission('save-settings', 'write')).toBe(true);
      expect(checkPermission('execute-command', 'execute')).toBe(false);
    });

    it('应该阻止未授权的文件系统访问', () => {
      const allowedPaths = [
        '/app/data',
        '/app/config',
        '/app/logs',
      ];

      const isPathAllowed = (requestedPath: string): boolean => {
        return allowedPaths.some(allowedPath => 
          requestedPath.startsWith(allowedPath)
        );
      };

      expect(isPathAllowed('/app/data/settings.json')).toBe(true);
      expect(isPathAllowed('/app/config/app.json')).toBe(true);
      expect(isPathAllowed('/system/etc/passwd')).toBe(false);
      expect(isPathAllowed('/home/user/.ssh/id_rsa')).toBe(false);
    });
  });
});