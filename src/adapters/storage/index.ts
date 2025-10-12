// 存储适配器主入口文件
export { IStorageAdapter, StorageInfo, StorageChangeEvent, StorageAdapterCapabilities } from '../types';

// 具体实现
export { DesktopStorageAdapter } from './desktop.storage.adapter';
export { WebStorageAdapter } from './web.storage.adapter';

// 工厂类和便捷函数
export { 
  StorageAdapterFactory,
  createStorageAdapter,
  getStorageAdapter,
  resetStorageAdapter
} from './storage.factory';

// 导入工厂类用于默认导出
import { StorageAdapterFactory } from './storage.factory';

// 默认导出工厂创建函数
export default StorageAdapterFactory.create;