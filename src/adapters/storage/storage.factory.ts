import { IStorageAdapter, Platform } from '../types';
import { DesktopStorageAdapter } from './desktop.storage.adapter';
import { WebStorageAdapter } from './web.storage.adapter';

export class StorageAdapterFactory {
  private static instance: IStorageAdapter | null = null;

  /**
   * 创建存储适配器实例
   * @param platform 可选的平台参数，如果不提供则自动检测
   * @returns 存储适配器实例
   */
  static async create(platform?: Platform): Promise<IStorageAdapter> {
    // 如果已有实例且平台匹配，直接返回
    if (this.instance && (!platform || this.instance.platform === platform)) {
      return this.instance;
    }

    const detectedPlatform = platform || this.detectPlatform();
    
    switch (detectedPlatform) {
      case 'desktop':
        this.instance = new DesktopStorageAdapter();
        break;
      case 'web':
        this.instance = new WebStorageAdapter();
        break;
      default:
        throw new Error(`Unsupported platform: ${detectedPlatform}`);
    }

    return this.instance;
  }

  /**
   * 获取当前存储适配器实例（如果存在）
   * @returns 当前实例或null
   */
  static getInstance(): IStorageAdapter | null {
    return this.instance;
  }

  /**
   * 重置工厂实例
   */
  static reset(): void {
    if (this.instance) {
      // 尝试清理资源
      if ('close' in this.instance && typeof this.instance.close === 'function') {
        this.instance.close().catch(console.error);
      }
      this.instance = null;
    }
  }

  /**
   * 检测当前运行平台
   * @returns 平台类型
   */
  private static detectPlatform(): Platform {
    // 检查是否在测试环境中，window被明确设置为undefined
    // 在vitest中，vi.stubGlobal('window', undefined) 会让 typeof window === 'undefined'
    const hasWindow = typeof window !== 'undefined' && window !== null && window !== undefined;
    
    if (hasWindow) {
      // 检测是否在Electron环境中
      if (window.process && window.process.type) {
        return 'desktop';
      }
      
      // 检测是否有Electron的API
      if (window.require) {
        try {
          window.require('electron');
          return 'desktop';
        } catch (error) {
          // 不是Electron环境
        }
      }
      
      // 如果window存在但不是Electron，则为Web环境
      return 'web';
    }

    // 检测是否在Node.js环境中（没有window对象或window被设置为undefined）
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      return 'desktop';
    }

    // 默认为Web环境
    return 'web';
  }

  /**
   * 检查平台是否支持特定存储类型
   * @param platform 平台类型
   * @param storageType 存储类型
   * @returns 是否支持
   */
  static isStorageTypeSupported(platform: Platform, storageType: 'sqlite' | 'indexeddb' | 'localstorage'): boolean {
    switch (platform) {
      case 'desktop':
        return storageType === 'sqlite';
      case 'web':
        switch (storageType) {
          case 'indexeddb':
            return typeof window !== 'undefined' && 
                   'indexedDB' in window && 
                   window.indexedDB !== null;
          case 'localstorage':
            return typeof window !== 'undefined' && 
                   'localStorage' in window && 
                   window.localStorage !== null;
          default:
            return false;
        }
      default:
        return false;
    }
  }

  /**
   * 获取平台支持的存储类型列表
   * @param platform 平台类型
   * @returns 支持的存储类型数组
   */
  static getSupportedStorageTypes(platform: Platform): string[] {
    const supported: string[] = [];

    switch (platform) {
      case 'desktop':
        supported.push('sqlite');
        break;
      case 'web':
        if (this.isStorageTypeSupported(platform, 'indexeddb')) {
          supported.push('indexeddb');
        }
        if (this.isStorageTypeSupported(platform, 'localstorage')) {
          supported.push('localstorage');
        }
        break;
    }

    return supported;
  }

  /**
   * 创建特定类型的存储适配器（用于测试或特殊需求）
   * @param type 存储适配器类型
   * @returns 存储适配器实例
   */
  static createSpecific(type: 'desktop' | 'web'): IStorageAdapter {
    switch (type) {
      case 'desktop':
        return new DesktopStorageAdapter();
      case 'web':
        return new WebStorageAdapter();
      default:
        throw new Error(`Unknown storage adapter type: ${type}`);
    }
  }

  /**
   * 测试存储适配器功能
   * @param adapter 存储适配器实例
   * @returns 测试结果
   */
  static async testAdapter(adapter: IStorageAdapter): Promise<{
    success: boolean;
    capabilities: any;
    error?: string;
  }> {
    try {
      // 基本功能测试
      const testKey = '__storage_test__';
      const testValue = { test: true, timestamp: Date.now() };

      // 测试写入
      await adapter.set(testKey, testValue);
      
      // 测试读取
      const retrieved = await adapter.get(testKey);
      
      // 测试删除
      await adapter.remove(testKey);
      
      // 验证数据一致性
      const isDataConsistent = JSON.stringify(retrieved) === JSON.stringify(testValue);
      
      if (!isDataConsistent) {
        throw new Error('Data consistency test failed');
      }

      return {
        success: true,
        capabilities: adapter.getCapabilities()
      };
    } catch (error) {
      return {
        success: false,
        capabilities: adapter.getCapabilities(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 获取存储适配器的详细信息
   * @param adapter 存储适配器实例
   * @returns 详细信息
   */
  static async getAdapterInfo(adapter: IStorageAdapter): Promise<{
    platform: Platform;
    capabilities: any;
    storageInfo: any;
    isHealthy: boolean;
  }> {
    try {
      const [capabilities, storageInfo, testResult] = await Promise.all([
        adapter.getCapabilities(),
        adapter.getStorageInfo(),
        this.testAdapter(adapter)
      ]);

      return {
        platform: adapter.platform,
        capabilities,
        storageInfo,
        isHealthy: testResult.success
      };
    } catch (error) {
      return {
        platform: adapter.platform,
        capabilities: adapter.getCapabilities(),
        storageInfo: { used: 0, available: 0, total: 0 },
        isHealthy: false
      };
    }
  }

  /**
   * 迁移数据从一个适配器到另一个适配器
   * @param sourceAdapter 源适配器
   * @param targetAdapter 目标适配器
   * @param options 迁移选项
   * @returns 迁移结果
   */
  static async migrateData(
    sourceAdapter: IStorageAdapter,
    targetAdapter: IStorageAdapter,
    options: {
      batchSize?: number;
      onProgress?: (progress: { current: number; total: number; key: string }) => void;
      skipExisting?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    migratedCount: number;
    skippedCount: number;
    errors: Array<{ key: string; error: string }>;
  }> {
    const { batchSize = 100, onProgress, skipExisting = false } = options;
    const result = {
      success: true,
      migratedCount: 0,
      skippedCount: 0,
      errors: [] as Array<{ key: string; error: string }>
    };

    try {
      const keys = await sourceAdapter.keys();
      const total = keys.length;

      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        const sourceData = await sourceAdapter.getMultiple(batch);

        for (const key of batch) {
          try {
            if (onProgress) {
              onProgress({ current: i + batch.indexOf(key) + 1, total, key });
            }

            const value = sourceData[key];
            if (value === null) continue;

            // 检查目标是否已存在
            if (skipExisting && await targetAdapter.has(key)) {
              result.skippedCount++;
              continue;
            }

            await targetAdapter.set(key, value);
            result.migratedCount++;
          } catch (error) {
            result.errors.push({
              key,
              error: error instanceof Error ? error.message : String(error)
            });
            result.success = false;
          }
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push({
        key: '__migration__',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return result;
  }
}

// 导出便捷函数
export const createStorageAdapter = StorageAdapterFactory.create;
export const getStorageAdapter = StorageAdapterFactory.getInstance;
export const resetStorageAdapter = StorageAdapterFactory.reset;