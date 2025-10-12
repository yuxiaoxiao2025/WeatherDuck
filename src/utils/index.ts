// 工具函数入口文件

export { cn } from './cn';

// 格式化工具函数
export const formatTemperature = (temp: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string => {
  if (unit === 'fahrenheit') {
    return `${Math.round(temp * 9/5 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
};

export const formatWindSpeed = (speed: number, unit: 'kmh' | 'mph' | 'ms' = 'kmh'): string => {
  switch (unit) {
    case 'mph':
      return `${Math.round(speed * 0.621371)} mph`;
    case 'ms':
      return `${Math.round(speed * 0.277778)} m/s`;
    default:
      return `${Math.round(speed)} km/h`;
  }
};

export const formatPressure = (pressure: number, unit: 'mb' | 'inHg' | 'kPa' = 'mb'): string => {
  switch (unit) {
    case 'inHg':
      return `${(pressure * 0.02953).toFixed(2)} inHg`;
    case 'kPa':
      return `${(pressure * 0.1).toFixed(1)} kPa`;
    default:
      return `${pressure} mb`;
  }
};

export const formatVisibility = (visibility: number, unit: 'km' | 'miles' = 'km'): string => {
  if (unit === 'miles') {
    return `${(visibility * 0.621371).toFixed(1)} mi`;
  }
  return `${visibility} km`;
};

// 时间格式化
export const formatTime = (time: string, format: '12h' | '24h' = '24h'): string => {
  const date = new Date(time);
  
  if (format === '12h') {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  if (format === 'relative') {
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
  }
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }
  
  return dateObj.toLocaleDateString('zh-CN');
};

// 数据验证工具
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 防抖和节流
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 数组工具
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const groupBy = <T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const group = key(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

// 对象工具
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

// 深拷贝
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// 错误处理
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await asyncFn();
  } catch (error) {
    console.error('Async operation failed:', error);
    return fallback;
  }
};