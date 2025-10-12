import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IStorageAdapter } from '../types';
import { StorageAdapterFactory } from '../storage';

describe('StorageAdapter', () => {
  let storageAdapter: IStorageAdapter;
  
  beforeEach(async () => {
    // 根据环境获取适配器实例
    storageAdapter = await StorageAdapterFactory.create();
  });

  afterEach(async () => {
    // 清理测试数据
    await storageAdapter.clear();
  });

  describe('基本存储操作', () => {
    it('应该能够存储和检索字符串数据', async () => {
      const key = 'test-string';
      const value = 'Hello, World!';
      
      await storageAdapter.set(key, value);
      const retrieved = await storageAdapter.get(key);
      
      expect(retrieved).toBe(value);
    });

    it('应该能够存储和检索对象数据', async () => {
      const key = 'test-object';
      const value = { name: 'WeatherDuck', version: '1.0.0', settings: { theme: 'dark' } };
      
      await storageAdapter.set(key, value);
      const retrieved = await storageAdapter.get(key);
      
      expect(retrieved).toEqual(value);
    });

    it('应该能够存储和检索数组数据', async () => {
      const key = 'test-array';
      const value = [1, 2, 3, { id: 1, name: 'test' }];
      
      await storageAdapter.set(key, value);
      const retrieved = await storageAdapter.get(key);
      
      expect(retrieved).toEqual(value);
    });

    it('应该在键不存在时返回undefined', async () => {
      const result = await storageAdapter.get('non-existent-key');
      expect(result).toBeUndefined();
    });
  });

  describe('删除操作', () => {
    it('应该能够删除存在的键', async () => {
      const key = 'test-delete';
      const value = 'to be deleted';
      
      await storageAdapter.set(key, value);
      expect(await storageAdapter.get(key)).toBe(value);
      
      await storageAdapter.remove(key);
      expect(await storageAdapter.get(key)).toBeUndefined();
    });

    it('删除不存在的键应该不抛出错误', async () => {
      await expect(storageAdapter.remove('non-existent-key')).resolves.not.toThrow();
    });
  });

  describe('清空操作', () => {
    it('应该能够清空所有数据', async () => {
      // 存储多个键值对
      await storageAdapter.set('key1', 'value1');
      await storageAdapter.set('key2', 'value2');
      await storageAdapter.set('key3', { data: 'value3' });
      
      // 验证数据存在
      expect(await storageAdapter.get('key1')).toBe('value1');
      expect(await storageAdapter.get('key2')).toBe('value2');
      expect(await storageAdapter.get('key3')).toEqual({ data: 'value3' });
      
      // 清空所有数据
      await storageAdapter.clear();
      
      // 验证数据已被清空
      expect(await storageAdapter.get('key1')).toBeUndefined();
      expect(await storageAdapter.get('key2')).toBeUndefined();
      expect(await storageAdapter.get('key3')).toBeUndefined();
    });
  });

  describe('键管理', () => {
    it('应该能够获取所有键', async () => {
      const testData = {
        'weather-settings': { location: 'Beijing' },
        'user-preferences': { theme: 'dark', language: 'zh-CN' },
        'cache-data': ['item1', 'item2']
      };
      
      // 存储测试数据
      for (const [key, value] of Object.entries(testData)) {
        await storageAdapter.set(key, value);
      }
      
      const keys = await storageAdapter.keys();
      
      expect(keys).toHaveLength(3);
      expect(keys).toContain('weather-settings');
      expect(keys).toContain('user-preferences');
      expect(keys).toContain('cache-data');
    });

    it('空存储应该返回空键数组', async () => {
      const keys = await storageAdapter.keys();
      expect(keys).toEqual([]);
    });
  });

  describe('存在性检查', () => {
    it('应该正确检查键是否存在', async () => {
      const key = 'existence-test';
      
      expect(await storageAdapter.has(key)).toBe(false);
      
      await storageAdapter.set(key, 'test value');
      expect(await storageAdapter.has(key)).toBe(true);
      
      await storageAdapter.remove(key);
      expect(await storageAdapter.has(key)).toBe(false);
    });
  });

  describe('数据大小和限制', () => {
    it('应该能够处理大型对象', async () => {
      const largeObject = {
        data: new Array(1000).fill(0).map((_, i) => ({
          id: i,
          name: `item-${i}`,
          description: `This is a description for item ${i}`,
          metadata: { created: new Date().toISOString(), index: i }
        }))
      };
      
      await storageAdapter.set('large-object', largeObject);
      const retrieved = await storageAdapter.get('large-object');
      
      expect(retrieved).toEqual(largeObject);
      expect(retrieved.data).toHaveLength(1000);
    });

    it('应该能够处理特殊字符和Unicode', async () => {
      const specialData = {
        chinese: '你好世界',
        emoji: '🌦️🦆',
        special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        unicode: '\u0048\u0065\u006C\u006C\u006F'
      };
      
      await storageAdapter.set('special-chars', specialData);
      const retrieved = await storageAdapter.get('special-chars');
      
      expect(retrieved).toEqual(specialData);
    });
  });

  describe('并发操作', () => {
    it('应该能够处理并发读写操作', async () => {
      const operations = [];
      
      // 创建多个并发操作
      for (let i = 0; i < 10; i++) {
        operations.push(storageAdapter.set(`concurrent-${i}`, `value-${i}`));
      }
      
      await Promise.all(operations);
      
      // 验证所有数据都正确存储
      for (let i = 0; i < 10; i++) {
        const value = await storageAdapter.get(`concurrent-${i}`);
        expect(value).toBe(`value-${i}`);
      }
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的键名', async () => {
      // 测试空字符串键
      await expect(storageAdapter.set('', 'value')).rejects.toThrow();
      
      // 测试null键
      await expect(storageAdapter.set(null as any, 'value')).rejects.toThrow();
      
      // 测试undefined键
      await expect(storageAdapter.set(undefined as any, 'value')).rejects.toThrow();
    });

    it('应该处理循环引用对象', async () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      await expect(storageAdapter.set('circular', circularObj)).rejects.toThrow();
    });
  });

  describe('平台特定功能', () => {
    it('应该提供平台信息', () => {
      expect(storageAdapter.platform).toBeDefined();
      expect(['desktop', 'web']).toContain(storageAdapter.platform);
    });

    it('应该提供存储类型信息', () => {
      expect(storageAdapter.storageType).toBeDefined();
      
      if (storageAdapter.platform === 'desktop') {
        expect(storageAdapter.storageType).toBe('sqlite');
      } else {
        expect(['indexeddb', 'localstorage']).toContain(storageAdapter.storageType);
      }
    });
  });
});

// 桌面版特定测试
describe('DesktopStorageAdapter (SQLite)', () => {
  let adapter: IStorageAdapter;
  
  beforeEach(async () => {
    // 模拟桌面环境
    vi.stubGlobal('process', { 
      platform: 'win32', 
      versions: { node: '18.0.0' },
      cwd: () => 'E:\\trae\\WeatherDuck'
    });
    vi.stubGlobal('window', undefined);
    
    // 重置工厂实例，确保重新检测平台
    StorageAdapterFactory.reset();
    adapter = await StorageAdapterFactory.create();
  });

  it('应该使用SQLite作为存储后端', () => {
    expect(adapter.platform).toBe('desktop');
    expect(adapter.storageType).toBe('sqlite');
  });

  it('应该支持事务操作', async () => {
    // 这个测试假设桌面版支持事务
    if ('transaction' in adapter) {
      const transaction = await (adapter as any).transaction();
      expect(transaction).toBeDefined();
    }
  });
});

// Web版特定测试
describe('WebStorageAdapter (IndexedDB/LocalStorage)', () => {
  let adapter: IStorageAdapter;
  
  beforeEach(async () => {
    // 模拟Web环境
    vi.stubGlobal('window', {
      indexedDB: {},
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      }
    });
    vi.stubGlobal('process', undefined);
    
    // 重置工厂实例，确保重新检测平台
    StorageAdapterFactory.reset();
    adapter = await StorageAdapterFactory.create();
  });

  it('应该使用IndexedDB或LocalStorage作为存储后端', () => {
    expect(adapter.platform).toBe('web');
    expect(['indexeddb', 'localstorage']).toContain(adapter.storageType);
  });

  it('应该在IndexedDB不可用时降级到LocalStorage', async () => {
    // 模拟IndexedDB不可用
    vi.stubGlobal('window', {
      indexedDB: undefined,
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      }
    });
    
    // 重置工厂实例，确保重新检测存储类型
    StorageAdapterFactory.reset();
    const fallbackAdapter = await StorageAdapterFactory.create();
    expect(fallbackAdapter.storageType).toBe('localstorage');
  });
});