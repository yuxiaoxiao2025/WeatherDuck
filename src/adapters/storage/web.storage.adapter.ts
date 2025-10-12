import { openDB, IDBPDatabase, IDBPTransaction } from 'idb';
import {
  IStorageAdapter,
  StorageInfo,
  StorageChangeEvent,
  StorageAdapterCapabilities,
  Platform
} from '../types';

interface StorageRecord {
  key: string;
  value: any;
  type: string;
  createdAt: number;
  updatedAt: number;
}

export class WebStorageAdapter implements IStorageAdapter {
  public readonly platform: Platform = 'web';
  public get storageType(): string {
    return this.isIndexedDBSupported ? 'indexeddb' : 'localstorage';
  }
  private db: IDBPDatabase | null = null;
  private dbName = 'weather-duck-storage';
  private dbVersion = 1;
  private storeName = 'storage';
  private isIndexedDBSupported = false;
  private eventListeners: Set<(event: StorageChangeEvent) => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.checkIndexedDBSupport();
  }

  private checkIndexedDBSupport(): void {
    try {
      this.isIndexedDBSupported = 'indexedDB' in window && 
                                  window.indexedDB !== null &&
                                  window.indexedDB !== undefined;
    } catch (error) {
      this.isIndexedDBSupported = false;
    }
  }

  private async initializeIndexedDB(): Promise<void> {
    if (!this.isIndexedDBSupported) {
      throw new Error('IndexedDB is not supported');
    }

    try {
      this.db = await openDB(this.dbName, this.dbVersion, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('storage')) {
            const store = db.createObjectStore('storage', { keyPath: 'key' });
            store.createIndex('updatedAt', 'updatedAt');
          }
        },
      });
    } catch (error) {
      throw new Error(`Failed to initialize IndexedDB: ${error}`);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    if (this.isIndexedDBSupported) {
      try {
        await this.initializeIndexedDB();
      } catch (error) {
        console.warn('IndexedDB initialization failed, falling back to LocalStorage:', error);
        this.isIndexedDBSupported = false;
      }
    }

    this.isInitialized = true;
  }

  private serializeValue(value: any): { serialized: string; type: string } {
    if (value === null || value === undefined) {
      return { serialized: '', type: 'null' };
    }

    const type = typeof value;
    
    switch (type) {
      case 'string':
        return { serialized: value, type: 'string' };
      case 'number':
        return { serialized: value.toString(), type: 'number' };
      case 'boolean':
        return { serialized: value.toString(), type: 'boolean' };
      case 'object':
        try {
          return { serialized: JSON.stringify(value), type: 'object' };
        } catch (error) {
          throw new Error('Cannot serialize circular reference');
        }
      default:
        return { serialized: String(value), type: 'string' };
    }
  }

  private deserializeValue(serialized: string, type: string): any {
    switch (type) {
      case 'null':
        return null;
      case 'string':
        return serialized;
      case 'number':
        return Number(serialized);
      case 'boolean':
        return serialized === 'true';
      case 'object':
        try {
          return JSON.parse(serialized);
        } catch (error) {
          throw new Error(`Failed to parse stored object: ${error}`);
        }
      default:
        return serialized;
    }
  }

  private emitStorageChange(key: string, oldValue: any, newValue: any): void {
    const event: StorageChangeEvent = {
      key,
      oldValue,
      newValue,
      timestamp: Date.now()
    };
    
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in storage change listener:', error);
      }
    });
  }

  // IndexedDB 实现
  private async setIndexedDB(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    const oldValue = await this.getIndexedDB(key);
    const now = Date.now();

    const record: StorageRecord = {
      key,
      value,
      type: typeof value,
      createdAt: oldValue ? (await this.getRecordIndexedDB(key))?.createdAt || now : now,
      updatedAt: now
    };

    const tx = this.db.transaction(this.storeName, 'readwrite');
    await tx.objectStore(this.storeName).put(record);
    await tx.done;

    this.emitStorageChange(key, oldValue, value);
  }

  private async getIndexedDB<T = any>(key: string): Promise<T | undefined> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    const record = await this.db.get(this.storeName, key) as StorageRecord;
    return record ? record.value : undefined;
  }

  private async getRecordIndexedDB(key: string): Promise<StorageRecord | null> {
    if (!this.db) throw new Error('IndexedDB not initialized');
    return await this.db.get(this.storeName, key) as StorageRecord || null;
  }

  private async removeIndexedDB(key: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    const oldValue = await this.getIndexedDB(key);
    await this.db.delete(this.storeName, key);
    
    if (oldValue !== null) {
      this.emitStorageChange(key, oldValue, null);
    }
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    const keys = await this.keysIndexedDB();
    await this.db.clear(this.storeName);
    
    keys.forEach(key => {
      this.emitStorageChange(key, undefined, null);
    });
  }

  private async keysIndexedDB(): Promise<string[]> {
    if (!this.db) throw new Error('IndexedDB not initialized');
    return await this.db.getAllKeys(this.storeName) as string[];
  }

  private async hasIndexedDB(key: string): Promise<boolean> {
    if (!this.db) throw new Error('IndexedDB not initialized');
    const count = await this.db.count(this.storeName, key);
    return count > 0;
  }

  private async sizeIndexedDB(): Promise<number> {
    if (!this.db) throw new Error('IndexedDB not initialized');
    return await this.db.count(this.storeName);
  }

  // LocalStorage 实现
  private getLocalStorageKey(key: string): string {
    return `weather-duck:${key}`;
  }

  private setLocalStorage(key: string, value: any): void {
    if (!window.localStorage) {
      throw new Error('LocalStorage is not supported');
    }

    const oldValue = this.getLocalStorage(key);
    const { serialized, type } = this.serializeValue(value);
    const now = Date.now();

    const record = {
      value: serialized,
      type,
      createdAt: oldValue ? this.getLocalStorageRecord(key)?.createdAt || now : now,
      updatedAt: now
    };

    try {
      localStorage.setItem(this.getLocalStorageKey(key), JSON.stringify(record));
      this.emitStorageChange(key, oldValue, value);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to set value in LocalStorage: ${error}`);
    }
  }

  private getLocalStorage<T = any>(key: string): T | undefined {
    if (!window.localStorage) {
      throw new Error('LocalStorage is not supported');
    }

    try {
      const item = localStorage.getItem(this.getLocalStorageKey(key));
      if (!item) return undefined;

      const record = JSON.parse(item);
      return this.deserializeValue(record.value, record.type);
    } catch (error) {
      console.warn(`Failed to get value from LocalStorage for key "${key}":`, error);
      return undefined;
    }
  }

  private getLocalStorageRecord(key: string): { createdAt: number; updatedAt: number } | null {
    if (!window.localStorage) return null;

    try {
      const item = localStorage.getItem(this.getLocalStorageKey(key));
      if (!item) return null;

      const record = JSON.parse(item);
      return {
        createdAt: record.createdAt || 0,
        updatedAt: record.updatedAt || 0
      };
    } catch (error) {
      return null;
    }
  }

  private removeLocalStorage(key: string): void {
    if (!window.localStorage) {
      throw new Error('LocalStorage is not supported');
    }

    const oldValue = this.getLocalStorage(key);
    localStorage.removeItem(this.getLocalStorageKey(key));
    
    if (oldValue !== null) {
      this.emitStorageChange(key, oldValue, null);
    }
  }

  private clearLocalStorage(): void {
    if (!window.localStorage) {
      throw new Error('LocalStorage is not supported');
    }

    const keys = this.keysLocalStorage();
    
    keys.forEach(key => {
      localStorage.removeItem(this.getLocalStorageKey(key));
      this.emitStorageChange(key, undefined, null);
    });
  }

  private keysLocalStorage(): string[] {
    if (!window.localStorage) return [];

    const prefix = 'weather-duck:';
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.substring(prefix.length));
      }
    }
    
    return keys;
  }

  private hasLocalStorage(key: string): boolean {
    if (!window.localStorage) return false;
    return localStorage.getItem(this.getLocalStorageKey(key)) !== null;
  }

  private sizeLocalStorage(): number {
    return this.keysLocalStorage().length;
  }

  // 公共接口实现
  async set(key: string, value: any): Promise<void> {
    await this.ensureInitialized();
    
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    if (this.isIndexedDBSupported && this.db) {
      await this.setIndexedDB(key, value);
    } else {
      this.setLocalStorage(key, value);
    }
  }

  async get<T = any>(key: string): Promise<T | undefined> {
    await this.ensureInitialized();
    
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    if (this.isIndexedDBSupported && this.db) {
      return await this.getIndexedDB<T>(key);
    } else {
      return this.getLocalStorage<T>(key);
    }
  }

  async remove(key: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    if (this.isIndexedDBSupported && this.db) {
      await this.removeIndexedDB(key);
    } else {
      this.removeLocalStorage(key);
    }
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();

    if (this.isIndexedDBSupported && this.db) {
      await this.clearIndexedDB();
    } else {
      this.clearLocalStorage();
    }
  }

  async keys(): Promise<string[]> {
    await this.ensureInitialized();

    if (this.isIndexedDBSupported && this.db) {
      return await this.keysIndexedDB();
    } else {
      return this.keysLocalStorage();
    }
  }

  async has(key: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!key || typeof key !== 'string') {
      return false;
    }

    if (this.isIndexedDBSupported && this.db) {
      return await this.hasIndexedDB(key);
    } else {
      return this.hasLocalStorage(key);
    }
  }

  async size(): Promise<number> {
    await this.ensureInitialized();

    if (this.isIndexedDBSupported && this.db) {
      return await this.sizeIndexedDB();
    } else {
      return this.sizeLocalStorage();
    }
  }

  async setMultiple(items: Record<string, any>): Promise<void> {
    await this.ensureInitialized();

    const keys = Object.keys(items);
    if (keys.length === 0) return;

    if (this.isIndexedDBSupported && this.db) {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const now = Date.now();

      for (const key of keys) {
        const oldValue = await this.getIndexedDB(key);
        const existingRecord = await this.getRecordIndexedDB(key);
        
        const record: StorageRecord = {
          key,
          value: items[key],
          type: typeof items[key],
          createdAt: existingRecord?.createdAt || now,
          updatedAt: now
        };

        await store.put(record);
        this.emitStorageChange(key, oldValue, items[key]);
      }

      await tx.done;
    } else {
      // LocalStorage 批量操作
      keys.forEach(key => {
        this.setLocalStorage(key, items[key]);
      });
    }
  }

  async getMultiple<T = any>(keys: string[]): Promise<Record<string, T | undefined>> {
    await this.ensureInitialized();

    const result: Record<string, T | null> = {};

    if (keys.length === 0) return result;

    if (this.isIndexedDBSupported && this.db) {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);

      for (const key of keys) {
        const record = await store.get(key) as StorageRecord;
        result[key] = record ? record.value : null;
      }

      await tx.done;
    } else {
      keys.forEach(key => {
        result[key] = this.getLocalStorage<T>(key);
      });
    }

    return result;
  }

  async removeMultiple(keys: string[]): Promise<void> {
    await this.ensureInitialized();

    if (keys.length === 0) return;

    if (this.isIndexedDBSupported && this.db) {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);

      for (const key of keys) {
        const oldValue = await this.getIndexedDB(key);
        await store.delete(key);
        
        if (oldValue !== null) {
          this.emitStorageChange(key, oldValue, null);
        }
      }

      await tx.done;
    } else {
      keys.forEach(key => {
        this.removeLocalStorage(key);
      });
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    await this.ensureInitialized();

    if (this.isIndexedDBSupported && this.db) {
      // IndexedDB 存储信息估算
      try {
        const estimate = await navigator.storage?.estimate();
        return {
          used: estimate?.usage || 0,
          available: (estimate?.quota || 0) - (estimate?.usage || 0),
          total: estimate?.quota || 0
        };
      } catch (error) {
        // 回退到简单估算
        const size = await this.size();
        const estimated = size * 1024; // 假设每个条目平均1KB
        return {
          used: estimated,
          available: 5 * 1024 * 1024 - estimated, // 假设5MB配额
          total: 5 * 1024 * 1024
        };
      }
    } else {
      // LocalStorage 存储信息估算
      let used = 0;
      const keys = this.keysLocalStorage();
      
      keys.forEach(key => {
        const item = localStorage.getItem(this.getLocalStorageKey(key));
        if (item) {
          used += item.length * 2; // UTF-16 编码，每字符2字节
        }
      });

      const total = 5 * 1024 * 1024; // 假设5MB配额
      return {
        used,
        available: total - used,
        total
      };
    }
  }

  onStorageChange(callback: (event: StorageChangeEvent) => void): () => void {
    this.eventListeners.add(callback);
    
    return () => {
      this.eventListeners.delete(callback);
    };
  }

  getCapabilities(): StorageAdapterCapabilities {
    if (this.isIndexedDBSupported) {
      return {
        maxKeyLength: 1000,
        maxValueSize: 100 * 1024 * 1024, // 100MB for IndexedDB
        supportsTransactions: true,
        supportsIndexing: true,
        supportsBinaryData: true,
        supportsCompression: false,
        supportsEncryption: false
      };
    } else {
      return {
        maxKeyLength: 1000,
        maxValueSize: 5 * 1024 * 1024, // 5MB for LocalStorage
        supportsTransactions: false,
        supportsIndexing: false,
        supportsBinaryData: false,
        supportsCompression: false,
        supportsEncryption: false
      };
    }
  }

  // 获取当前使用的存储类型
  getStorageType(): 'indexeddb' | 'localstorage' {
    return this.isIndexedDBSupported ? 'indexeddb' : 'localstorage';
  }

  // 清理资源
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.eventListeners.clear();
    this.isInitialized = false;
  }

  // 数据迁移方法（从LocalStorage到IndexedDB）
  async migrateFromLocalStorage(): Promise<void> {
    if (!this.isIndexedDBSupported || !this.db) {
      throw new Error('IndexedDB is not available for migration');
    }

    const localKeys = this.keysLocalStorage();
    if (localKeys.length === 0) return;

    const tx = this.db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    const now = Date.now();

    for (const key of localKeys) {
      const value = this.getLocalStorage(key);
      const record = this.getLocalStorageRecord(key);
      
      if (value !== null) {
        const storageRecord: StorageRecord = {
          key,
          value,
          type: typeof value,
          createdAt: record?.createdAt || now,
          updatedAt: record?.updatedAt || now
        };

        await store.put(storageRecord);
        // 迁移后删除LocalStorage中的数据
        localStorage.removeItem(this.getLocalStorageKey(key));
      }
    }

    await tx.done;
  }
}