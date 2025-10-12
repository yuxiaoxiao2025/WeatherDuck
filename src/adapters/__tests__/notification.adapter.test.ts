import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { INotificationAdapter, NotificationAdapterFactory, NotificationOptions, NotificationPermission } from '../types';

describe('NotificationAdapter', () => {
  let notificationAdapter: INotificationAdapter;
  
  beforeEach(async () => {
    notificationAdapter = await NotificationAdapterFactory.create();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('权限管理', () => {
    it('应该能够请求通知权限', async () => {
      const permission = await notificationAdapter.requestPermission();
      expect(['granted', 'denied', 'default']).toContain(permission);
    });

    it('应该能够获取当前权限状态', async () => {
      const permission = await notificationAdapter.getPermission();
      expect(['granted', 'denied', 'default']).toContain(permission);
    });

    it('应该在权限被拒绝时正确处理', async () => {
      // 模拟权限被拒绝
      vi.spyOn(notificationAdapter, 'getPermission').mockResolvedValue('denied');
      
      const permission = await notificationAdapter.getPermission();
      expect(permission).toBe('denied');
      
      // 尝试显示通知应该失败或被忽略
      const options: NotificationOptions = {
        title: 'Test Notification',
        body: 'This should not be shown'
      };
      
      await expect(notificationAdapter.show(options)).rejects.toThrow(/permission/i);
    });
  });

  describe('基本通知功能', () => {
    beforeEach(async () => {
      // 确保有权限
      vi.spyOn(notificationAdapter, 'getPermission').mockResolvedValue('granted');
    });

    it('应该能够显示基本通知', async () => {
      const options: NotificationOptions = {
        title: 'Weather Alert',
        body: 'Heavy rain expected in your area'
      };
      
      const notification = await notificationAdapter.show(options);
      expect(notification).toBeDefined();
      expect(notification.id).toBeDefined();
    });

    it('应该能够显示带图标的通知', async () => {
      const options: NotificationOptions = {
        title: 'Weather Update',
        body: 'Sunny weather today',
        icon: '/assets/icons/sunny.png'
      };
      
      const notification = await notificationAdapter.show(options);
      expect(notification).toBeDefined();
      expect(notification.id).toBeDefined();
    });

    it('应该能够显示带操作按钮的通知', async () => {
      const options: NotificationOptions = {
        title: 'Weather Alert',
        body: 'Storm warning in effect',
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      };
      
      const notification = await notificationAdapter.show(options);
      expect(notification).toBeDefined();
    });

    it('应该能够显示带标签的通知', async () => {
      const options: NotificationOptions = {
        title: 'Daily Weather',
        body: 'Your daily weather summary is ready',
        tag: 'daily-summary'
      };
      
      const notification = await notificationAdapter.show(options);
      expect(notification).toBeDefined();
    });

    it('应该能够显示静默通知', async () => {
      const options: NotificationOptions = {
        title: 'Background Update',
        body: 'Weather data updated',
        silent: true
      };
      
      const notification = await notificationAdapter.show(options);
      expect(notification).toBeDefined();
    });
  });

  describe('通知事件处理', () => {
    beforeEach(async () => {
      vi.spyOn(notificationAdapter, 'getPermission').mockResolvedValue('granted');
    });

    it('应该能够处理通知点击事件', async () => {
      const clickHandler = vi.fn();
      
      const options: NotificationOptions = {
        title: 'Clickable Notification',
        body: 'Click me!',
        onClick: clickHandler
      };
      
      const notification = await notificationAdapter.show(options);
      
      // 模拟点击事件
      if (notification.click) {
        notification.click();
        expect(clickHandler).toHaveBeenCalled();
      }
    });

    it('应该能够处理通知关闭事件', async () => {
      const closeHandler = vi.fn();
      
      const options: NotificationOptions = {
        title: 'Closeable Notification',
        body: 'I can be closed',
        onClose: closeHandler
      };
      
      const notification = await notificationAdapter.show(options);
      
      // 模拟关闭事件
      if (notification.close) {
        notification.close();
        expect(closeHandler).toHaveBeenCalled();
      }
    });

    it('应该能够处理操作按钮点击事件', async () => {
      const actionHandler = vi.fn();
      
      const options: NotificationOptions = {
        title: 'Action Notification',
        body: 'Choose an action',
        actions: [
          { action: 'accept', title: 'Accept' },
          { action: 'decline', title: 'Decline' }
        ],
        onAction: actionHandler
      };
      
      const notification = await notificationAdapter.show(options);
      
      // 模拟操作按钮点击
      if (notification.triggerAction) {
        notification.triggerAction('accept');
        expect(actionHandler).toHaveBeenCalledWith('accept');
      }
    });

    it('应该能够处理通知错误事件', async () => {
      const errorHandler = vi.fn();
      
      const options: NotificationOptions = {
        title: 'Error Test',
        body: 'This might fail',
        onError: errorHandler
      };
      
      // 模拟错误情况
      vi.spyOn(notificationAdapter, 'show').mockRejectedValue(new Error('Notification failed'));
      
      try {
        await notificationAdapter.show(options);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('通知管理', () => {
    beforeEach(async () => {
      vi.spyOn(notificationAdapter, 'getPermission').mockResolvedValue('granted');
    });

    it('应该能够关闭特定通知', async () => {
      const options: NotificationOptions = {
        title: 'Closeable Notification',
        body: 'This will be closed'
      };
      
      const notification = await notificationAdapter.show(options);
      
      await notificationAdapter.close(notification.id);
      
      // 验证通知已关闭
      const activeNotifications = await notificationAdapter.getActiveNotifications();
      expect(activeNotifications.find(n => n.id === notification.id)).toBeUndefined();
    });

    it('应该能够关闭所有通知', async () => {
      // 创建多个通知
      const notifications = await Promise.all([
        notificationAdapter.show({ title: 'Notification 1', body: 'Body 1' }),
        notificationAdapter.show({ title: 'Notification 2', body: 'Body 2' }),
        notificationAdapter.show({ title: 'Notification 3', body: 'Body 3' })
      ]);
      
      await notificationAdapter.closeAll();
      
      const activeNotifications = await notificationAdapter.getActiveNotifications();
      expect(activeNotifications).toHaveLength(0);
    });

    it('应该能够获取活动通知列表', async () => {
      const options1: NotificationOptions = {
        title: 'Active Notification 1',
        body: 'Still showing'
      };
      
      const options2: NotificationOptions = {
        title: 'Active Notification 2',
        body: 'Also showing'
      };
      
      await notificationAdapter.show(options1);
      await notificationAdapter.show(options2);
      
      const activeNotifications = await notificationAdapter.getActiveNotifications();
      expect(activeNotifications.length).toBeGreaterThanOrEqual(2);
    });

    it('应该能够替换相同标签的通知', async () => {
      const tag = 'weather-update';
      
      const notification1 = await notificationAdapter.show({
        title: 'Weather Update 1',
        body: 'First update',
        tag
      });
      
      const notification2 = await notificationAdapter.show({
        title: 'Weather Update 2',
        body: 'Second update',
        tag
      });
      
      const activeNotifications = await notificationAdapter.getActiveNotifications();
      const taggedNotifications = activeNotifications.filter(n => n.tag === tag);
      
      // 应该只有一个带该标签的通知
      expect(taggedNotifications).toHaveLength(1);
      expect(taggedNotifications[0].id).toBe(notification2.id);
    });
  });

  describe('通知配置和自定义', () => {
    beforeEach(async () => {
      vi.spyOn(notificationAdapter, 'getPermission').mockResolvedValue('granted');
    });

    it('应该支持自定义通知持续时间', async () => {
      const options: NotificationOptions = {
        title: 'Timed Notification',
        body: 'This will auto-close',
        requireInteraction: false,
        timeout: 3000
      };
      
      const notification = await notificationAdapter.show(options);
      expect(notification).toBeDefined();
    });

    it('应该支持持久通知', async () => {
      const options: NotificationOptions = {
        title: 'Persistent Notification',
        body: 'This requires user interaction',
        requireInteraction: true
      };
      
      const notification = await notificationAdapter.show(options);
      expect(notification).toBeDefined();
    });

    it('应该支持通知优先级', async () => {
      const options: NotificationOptions = {
        title: 'High Priority Alert',
        body: 'Severe weather warning',
        priority: 'high'
      };
      
      const notification = await notificationAdapter.show(options);
      expect(notification).toBeDefined();
    });

    it('应该支持通知分组', async () => {
      const groupId = 'weather-alerts';
      
      await notificationAdapter.show({
        title: 'Rain Alert',
        body: 'Rain starting soon',
        group: groupId
      });
      
      await notificationAdapter.show({
        title: 'Wind Alert',
        body: 'Strong winds expected',
        group: groupId
      });
      
      const activeNotifications = await notificationAdapter.getActiveNotifications();
      const groupedNotifications = activeNotifications.filter(n => n.group === groupId);
      
      expect(groupedNotifications.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('平台特定功能', () => {
    it('应该提供平台信息', () => {
      expect(notificationAdapter.platform).toBeDefined();
      expect(['desktop', 'web']).toContain(notificationAdapter.platform);
    });

    it('应该提供支持的功能列表', () => {
      const capabilities = notificationAdapter.getCapabilities();
      expect(capabilities).toBeDefined();
      expect(capabilities.supportsActions).toBeDefined();
      expect(capabilities.supportsIcon).toBeDefined();
      expect(capabilities.supportsImage).toBeDefined();
      expect(capabilities.supportsBadge).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的通知选项', async () => {
      const invalidOptions = {
        title: '', // 空标题
        body: 'Valid body'
      } as NotificationOptions;
      
      await expect(notificationAdapter.show(invalidOptions)).rejects.toThrow();
    });

    it('应该处理权限不足的情况', async () => {
      vi.spyOn(notificationAdapter, 'getPermission').mockResolvedValue('denied');
      
      const options: NotificationOptions = {
        title: 'Test Notification',
        body: 'This should fail'
      };
      
      await expect(notificationAdapter.show(options)).rejects.toThrow(/permission/i);
    });

    it('应该处理不存在的通知ID', async () => {
      await expect(notificationAdapter.close('non-existent-id')).resolves.not.toThrow();
    });
  });
});

// 桌面版特定测试
describe('DesktopNotificationAdapter (Electron)', () => {
  let adapter: INotificationAdapter;
  
  beforeEach(async () => {
    // 模拟Electron环境
    vi.stubGlobal('process', { platform: 'win32' });
    vi.stubGlobal('window', undefined);
    
    adapter = await NotificationAdapterFactory.create();
  });

  it('应该使用Electron通知系统', () => {
    expect(adapter.platform).toBe('desktop');
  });

  it('应该支持原生系统通知', async () => {
    vi.spyOn(adapter, 'getPermission').mockResolvedValue('granted');
    
    const options: NotificationOptions = {
      title: 'Native Notification',
      body: 'This is a native system notification'
    };
    
    const notification = await adapter.show(options);
    expect(notification).toBeDefined();
  });
});

// Web版特定测试
describe('WebNotificationAdapter (Web Notification API)', () => {
  let adapter: INotificationAdapter;
  
  beforeEach(async () => {
    // 模拟Web环境
    const mockNotification = vi.fn().mockImplementation((title, options) => ({
      title,
      body: options?.body,
      icon: options?.icon,
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
    
    vi.stubGlobal('window', {
      Notification: mockNotification
    });
    vi.stubGlobal('process', undefined);
    
    adapter = await NotificationAdapterFactory.create();
  });

  it('应该使用Web Notification API', () => {
    expect(adapter.platform).toBe('web');
  });

  it('应该正确处理浏览器权限', async () => {
    // 模拟浏览器权限API
    vi.stubGlobal('Notification', {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('granted')
    });
    
    const permission = await adapter.requestPermission();
    expect(permission).toBe('granted');
  });

  it('应该在不支持通知的浏览器中优雅降级', async () => {
    // 模拟不支持通知的浏览器
    vi.stubGlobal('window', {});
    
    const fallbackAdapter = await NotificationAdapterFactory.create();
    
    const options: NotificationOptions = {
      title: 'Fallback Test',
      body: 'This should use fallback mechanism'
    };
    
    // 应该使用替代方案（如页面内通知）
    await expect(fallbackAdapter.show(options)).resolves.toBeDefined();
  });
});