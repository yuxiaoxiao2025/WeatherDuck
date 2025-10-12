import { useState, useEffect, useCallback } from 'react';

/**
 * 本地存储Hook
 * 提供类型安全的localStorage操作
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 设置值到localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // 触发自定义事件，通知其他组件
      window.dispatchEvent(new CustomEvent('localStorage', {
        detail: { key, value: valueToStore }
      }));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // 删除值
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('localStorage', {
        detail: { key, value: null }
      }));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // 监听localStorage变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('key' in e && e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      } else if ('detail' in e && e.detail.key === key) {
        setStoredValue(e.detail.value ?? initialValue);
      }
    };

    // 监听原生storage事件（跨标签页）
    window.addEventListener('storage', handleStorageChange);
    // 监听自定义事件（同标签页）
    window.addEventListener('localStorage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorage', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}