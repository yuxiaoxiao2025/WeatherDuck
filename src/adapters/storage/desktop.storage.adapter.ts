import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';
import { EventEmitter } from 'events';
import {
  IStorageAdapter,
  StorageInfo,
  StorageChangeEvent,
  StorageAdapterCapabilities,
  Platform
} from '../types';

export class DesktopStorageAdapter implements IStorageAdapter {
  public readonly platform: Platform = 'desktop';
  public readonly storageType: string = 'sqlite';
  private db: Database | null = null;
  private eventEmitter = new EventEmitter();
  private dbPath: string;
  private isInitialized = false;

  constructor() {
    // 获取应用数据目录
    const userDataPath = app?.getPath('userData') || process.cwd();
    this.dbPath = join(userDataPath, 'weather-duck-storage.db');
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = new Database(this.dbPath);

      // 创建存储表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS storage (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          type TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);

      // 创建索引
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_storage_updated_at 
        ON storage(updated_at)
      `);

      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
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
    this.eventEmitter.emit('storage-change', event);
  }

  async set(key: string, value: any): Promise<void> {
    await this.ensureInitialized();
    
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    const { serialized, type } = this.serializeValue(value);
    const now = Date.now();

    // 获取旧值用于事件
    const oldValue = await this.get(key);

    try {
      const stmt = this.db!.prepare(`
        INSERT OR REPLACE INTO storage (key, value, type, created_at, updated_at)
        VALUES (?, ?, ?, 
          COALESCE((SELECT created_at FROM storage WHERE key = ?), ?), 
          ?)
      `);

      stmt.run(key, serialized, type, key, now, now);

      // 发出存储变化事件
      setImmediate(() => {
        this.emitStorageChange(key, oldValue, value);
      });
    } catch (error) {
      throw new Error(`Failed to set value: ${error}`);
    }
  }

  async get<T = any>(key: string): Promise<T | undefined> {
    await this.ensureInitialized();
    
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    try {
      const stmt = this.db!.prepare('SELECT value, type FROM storage WHERE key = ?');
      const row = stmt.get(key) as any;

      if (!row) {
        return undefined;
      }

      return this.deserializeValue(row.value, row.type);
    } catch (error) {
      throw new Error(`Failed to get value: ${error}`);
    }
  }

  async remove(key: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    try {
      const stmt = this.db!.prepare('DELETE FROM storage WHERE key = ?');
      const result = stmt.run(key);
      
      if (result.changes > 0) {
        // Emit storage change event
        this.eventEmitter.emit('storageChange', {
          type: 'remove',
          key,
          oldValue: undefined,
          newValue: undefined
        });
      }
    } catch (error) {
      throw new Error(`Failed to remove value: ${error}`);
    }
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();

    try {
      const stmt = this.db!.prepare('DELETE FROM storage');
      stmt.run();
      
      // Emit storage change event
      this.eventEmitter.emit('storageChange', {
        type: 'clear',
        key: undefined,
        oldValue: undefined,
        newValue: undefined
      });
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }

  async keys(): Promise<string[]> {
    await this.ensureInitialized();

    try {
      const stmt = this.db!.prepare('SELECT key FROM storage ORDER BY key');
      const rows = stmt.all() as any[];
      
      return rows.map(row => row.key);
    } catch (error) {
      throw new Error(`Failed to get keys: ${error}`);
    }
  }

  async has(key: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    try {
      const stmt = this.db!.prepare('SELECT 1 FROM storage WHERE key = ?');
      const row = stmt.get(key);
      
      return !!row;
    } catch (error) {
      throw new Error(`Failed to check key existence: ${error}`);
    }
  }

  async size(): Promise<number> {
    await this.ensureInitialized();

    try {
      const stmt = this.db!.prepare('SELECT COUNT(*) as count FROM storage');
      const row = stmt.get() as any;
      
      return row.count;
    } catch (error) {
      throw new Error(`Failed to get storage size: ${error}`);
    }
  }

  async setMultiple(items: Record<string, any>): Promise<void> {
    await this.ensureInitialized();

    const keys = Object.keys(items);
    if (keys.length === 0) return;

    return new Promise((resolve, reject) => {
      this.db!.serialize(() => {
        this.db!.run('BEGIN TRANSACTION');

        const stmt = this.db!.prepare(`
          INSERT OR REPLACE INTO storage (key, value, type, created_at, updated_at)
          VALUES (?, ?, ?, 
            COALESCE((SELECT created_at FROM storage WHERE key = ?), ?), 
            ?)
        `);

        let completed = 0;
        let hasError = false;

        keys.forEach(async (key) => {
          if (hasError) return;

          try {
            const { serialized, type } = this.serializeValue(items[key]);
            const now = Date.now();
            const oldValue = await this.get(key);

            stmt.run([key, serialized, type, key, now, now], (err) => {
              if (err && !hasError) {
                hasError = true;
                this.db!.run('ROLLBACK');
                reject(new Error(`Failed to set multiple values: ${err.message}`));
                return;
              }

              completed++;
              
              // 发出存储变化事件
              setImmediate(() => {
                this.emitStorageChange(key, oldValue, items[key]);
              });

              if (completed === keys.length && !hasError) {
                this.db!.run('COMMIT', (err) => {
                  if (err) {
                    reject(new Error(`Failed to commit transaction: ${err.message}`));
                    return;
                  }
                  resolve();
                });
              }
            });
          } catch (error) {
            if (!hasError) {
              hasError = true;
              this.db!.run('ROLLBACK');
              reject(error);
            }
          }
        });

        stmt.finalize();
      });
    });
  }

  async getMultiple<T = any>(keys: string[]): Promise<Record<string, T | undefined>> {
    await this.ensureInitialized();

    if (keys.length === 0) return {};

    const placeholders = keys.map(() => '?').join(',');
    
    return new Promise((resolve, reject) => {
      this.db!.all(
        `SELECT key, value, type FROM storage WHERE key IN (${placeholders})`,
        keys,
        (err, rows: any[]) => {
          if (err) {
            reject(new Error(`Failed to get multiple values: ${err.message}`));
            return;
          }

          const result: Record<string, T | null> = {};
          
          // 初始化所有键为null
          keys.forEach(key => {
            result[key] = null;
          });

          // 填充找到的值
          rows.forEach(row => {
            try {
              result[row.key] = this.deserializeValue(row.value, row.type);
            } catch (error) {
              reject(error);
              return;
            }
          });

          resolve(result);
        }
      );
    });
  }

  async removeMultiple(keys: string[]): Promise<void> {
    await this.ensureInitialized();

    if (keys.length === 0) return;

    // 获取旧值用于事件
    const oldValues = await this.getMultiple(keys);

    const placeholders = keys.map(() => '?').join(',');
    
    try {
      const stmt = this.db!.prepare(`DELETE FROM storage WHERE key IN (${placeholders})`);
      stmt.run(keys);

      // 发出存储变化事件
      setImmediate(() => {
        keys.forEach(key => {
          if (oldValues[key] !== null) {
            this.emitStorageChange(key, oldValues[key], null);
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to remove multiple values: ${error}`);
    }
  }

  async setMultiple(items: Record<string, any>): Promise<void> {
    await this.ensureInitialized();

    const keys = Object.keys(items);
    if (keys.length === 0) return;

    try {
      const stmt = this.db!.prepare(`
        INSERT OR REPLACE INTO storage (key, value, type, created_at, updated_at)
        VALUES (?, ?, ?, 
          COALESCE((SELECT created_at FROM storage WHERE key = ?), ?), 
          ?)
      `);

      const now = Date.now();
      
      // 使用事务批量插入
      const transaction = this.db!.transaction(() => {
        for (const key of keys) {
          const value = items[key];
          const { serialized, type } = this.serializeValue(value);
          stmt.run(key, serialized, type, key, now, now);
        }
      });

      transaction();

      // 发出存储变化事件
      setImmediate(() => {
        keys.forEach(key => {
          this.emitStorageChange(key, undefined, items[key]);
        });
      });
    } catch (error) {
      throw new Error(`Failed to set multiple values: ${error}`);
    }
  }

  async getMultiple<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    await this.ensureInitialized();

    if (keys.length === 0) return {};

    try {
      const placeholders = keys.map(() => '?').join(',');
      const stmt = this.db!.prepare(`SELECT key, value, type FROM storage WHERE key IN (${placeholders})`);
      const rows = stmt.all(keys) as any[];

      const result: Record<string, T | null> = {};
      
      // 初始化所有键为null
      keys.forEach(key => {
        result[key] = null;
      });

      // 填充找到的值
      rows.forEach(row => {
        result[row.key] = this.deserializeValue(row.value, row.type);
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to get multiple values: ${error}`);
    }
  }

  async removeMultiple(keys: string[]): Promise<void> {
    await this.ensureInitialized();

    if (keys.length === 0) return;

    try {
      const placeholders = keys.map(() => '?').join(',');
      const stmt = this.db!.prepare(`DELETE FROM storage WHERE key IN (${placeholders})`);
      stmt.run(keys);

      // 发出存储变化事件
      setImmediate(() => {
        keys.forEach(key => {
          this.emitStorageChange(key, undefined, null);
        });
      });
    } catch (error) {
      throw new Error(`Failed to remove multiple values: ${error}`);
    }
  }

  async getInfo(): Promise<StorageInfo> {
    await this.ensureInitialized();

    try {
      const stmt = this.db!.prepare('SELECT COUNT(*) as count, SUM(LENGTH(value)) as totalSize FROM storage');
      const row = stmt.get() as any;

      return {
        type: 'sqlite',
        size: row.count || 0,
        totalSize: row.totalSize || 0,
        available: true,
        persistent: true
      };
    } catch (error) {
      throw new Error(`Failed to get storage info: ${error}`);
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    await this.ensureInitialized();

    try {
      const fs = require('fs');
      const stats = fs.statSync(this.dbPath);
      
      const used = stats.size;
      
      // 获取可用空间（简化实现，实际应该检查磁盘空间）
      const available = 1024 * 1024 * 1024; // 假设1GB可用空间
      const total = used + available;

      return {
        used,
        available,
        total
      };
    } catch (error) {
      throw new Error(`Failed to get storage info: ${error}`);
    }
  }

  onStorageChange(callback: (event: StorageChangeEvent) => void): () => void {
    this.eventEmitter.on('storage-change', callback);
    
    return () => {
      this.eventEmitter.off('storage-change', callback);
    };
  }

  getCapabilities(): StorageAdapterCapabilities {
    return {
      maxKeyLength: 1000,
      maxValueSize: 10 * 1024 * 1024, // 10MB
      supportsTransactions: true,
      supportsIndexing: true,
      supportsBinaryData: true,
      supportsCompression: false,
      supportsEncryption: false
    };
  }

  // 清理资源
  async close(): Promise<void> {
    if (this.db) {
      try {
        this.db.close();
        this.db = null;
        this.isInitialized = false;
      } catch (error) {
        console.error('Error closing database:', error);
        throw new Error(`Failed to close database: ${error}`);
      }
    }
  }

  // 数据库维护方法
  async vacuum(): Promise<void> {
    await this.ensureInitialized();

    try {
      this.db!.exec('VACUUM');
    } catch (error) {
      throw new Error(`Failed to vacuum database: ${error}`);
    }
  }

  async getStats(): Promise<{
    totalRecords: number;
    oldestRecord: number;
    newestRecord: number;
    averageValueSize: number;
  }> {
    await this.ensureInitialized();

    try {
      const stmt = this.db!.prepare(`
        SELECT 
          COUNT(*) as totalRecords,
          MIN(created_at) as oldestRecord,
          MAX(updated_at) as newestRecord,
          AVG(LENGTH(value)) as averageValueSize
        FROM storage
      `);
      const row = stmt.get() as any;

      return {
        totalRecords: row.totalRecords || 0,
        oldestRecord: row.oldestRecord || 0,
        newestRecord: row.newestRecord || 0,
        averageValueSize: row.averageValueSize || 0
      };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error}`);
    }
  }
}