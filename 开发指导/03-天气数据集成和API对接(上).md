# 天气鸭项目开发指导 - 阶段3：天气数据集成和API对接

## 📋 阶段概述

本阶段将集成和风天气API，实现天气数据获取、城市搜索和地理定位功能，建立完整的数据层架构。

---

## 🎯 核心目标

- ✅ 集成和风天气API（天气数据和GeoAPI）
- ✅ 实现城市搜索和地理定位功能
- ✅ 建立数据缓存和错误处理机制
- ✅ 创建类型安全的API客户端

---

## 📖 适用规范清单

### 核心规范
- **开发需求规范**
  - [规则 1] 生成完整可运行代码
  - [规则 6] 验证所有API是否存在
  - [规则 7] 第一次就完全修复错误

- **命名约定**
  - [约定 1] 变量命名 (camelCase)
  - [约定 2] 函数命名 (camelCase, 动词开头)
  - [约定 3] 类命名 (PascalCase)
  - [约定 4] 常量命名 (UPPER_SNAKE_CASE)

### 质量规范
- **安全规范**
  - [规则 7] API安全
  - [规则 8] 安全配置管理

- **错误处理规范**
  - [规则 1] 错误分类体系
  - [规则 2] 自定义错误类
  - [规则 6] 错误恢复策略
  - [规则 11] 超时和限流处理

---

## 🚀 实施步骤

### 步骤 3.1：配置环境变量和API密钥

**适用规范**: 
- 安全规范 [规则 8] 安全配置管理
- 命名约定 [约定 9] 环境变量命名

**更新 .env.example**:

```env
# 和风天气API配置（使用 UPPER_SNAKE_CASE）
VITE_QWEATHER_API_KEY=your_api_key_here
VITE_QWEATHER_API_HOST=https://devapi.qweather.com
VITE_QWEATHER_GEO_API_HOST=https://geoapi.qweather.com

# API配置
VITE_API_TIMEOUT=10000
VITE_API_RETRY_TIMES=3
VITE_API_CACHE_DURATION=1800000

# 默认城市配置
VITE_DEFAULT_CITY_ID=101020300
VITE_DEFAULT_CITY_NAME=上海市宝山区
```

**创建实际的 .env 文件**（不提交到Git）:

```env
VITE_QWEATHER_API_KEY=6b95a713b2854ca0b5b62ac9d9cca3bb
VITE_QWEATHER_API_HOST=https://devapi.qweather.com
VITE_QWEATHER_GEO_API_HOST=https://geoapi.qweather.com
VITE_API_TIMEOUT=10000
VITE_API_RETRY_TIMES=3
VITE_API_CACHE_DURATION=1800000
VITE_DEFAULT_CITY_ID=101020300
VITE_DEFAULT_CITY_NAME=上海市宝山区
```

**验收标准**:
- [ ] 环境变量使用 VITE_ 前缀
- [ ] 变量名使用 UPPER_SNAKE_CASE
- [ ] API密钥不硬编码在代码中
- [ ] .env 文件已在 .gitignore 中

---

### 步骤 3.2：创建API配置和常量

**适用规范**: 命名约定 [约定 4] 常量命名

**创建 src/config/api-config.ts**:

```typescript
/**
 * API配置文件
 * 遵循命名约定：常量使用 UPPER_SNAKE_CASE
 */

// 和风天气API端点配置
export const QWEATHER_API_CONFIG = {
  BASE_URL: import.meta.env.VITE_QWEATHER_API_HOST || 'https://devapi.qweather.com',
  VERSION: 'v7',
  ENDPOINTS: {
    CURRENT_WEATHER: '/weather/now',
    FORECAST_7D: '/weather/7d',
    FORECAST_24H: '/weather/24h',
    AIR_QUALITY: '/air/now',
    WARNING: '/warning/now',
  },
} as const;

// 和风天气GeoAPI配置
export const QWEATHER_GEO_CONFIG = {
  BASE_URL: import.meta.env.VITE_QWEATHER_GEO_API_HOST || 'https://geoapi.qweather.com',
  VERSION: 'v2',
  ENDPOINTS: {
    CITY_LOOKUP: '/city/lookup',
    CITY_TOP: '/city/top',
    POI_LOOKUP: '/poi/lookup',
    POI_RANGE: '/poi/range',
  },
} as const;

// API请求配置
export const API_REQUEST_CONFIG = {
  API_KEY: import.meta.env.VITE_QWEATHER_API_KEY || '',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  RETRY_TIMES: Number(import.meta.env.VITE_API_RETRY_TIMES) || 3,
  CACHE_DURATION: Number(import.meta.env.VITE_API_CACHE_DURATION) || 1800000, // 30分钟
} as const;

// 默认城市配置
export const DEFAULT_CITY_CONFIG = {
  CITY_ID: import.meta.env.VITE_DEFAULT_CITY_ID || '101020300',
  CITY_NAME: import.meta.env.VITE_DEFAULT_CITY_NAME || '上海市宝山区',
} as const;

// 验证API配置
export function validateApiConfig(): boolean {
  if (!API_REQUEST_CONFIG.API_KEY) {
    console.error('❌ 缺少和风天气API密钥！请在 .env 文件中配置 VITE_QWEATHER_API_KEY');
    return false;
  }
  
  console.log('✅ API配置验证通过');
  return true;
}
```

**验收标准**:
- [ ] 所有常量使用 UPPER_SNAKE_CASE
- [ ] 使用 as const 确保类型安全
- [ ] API配置验证函数正常工作

---

### 步骤 3.3：创建自定义错误类

**适用规范**: 
- 错误处理规范 [规则 1] 错误分类体系
- 错误处理规范 [规则 2] 自定义错误类

**创建 src/utils/errors.ts**:

```typescript
/**
 * 自定义错误类
 * 遵循错误处理规范：建立清晰的错误分类
 */

// 基础错误类
export class BaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public timestamp: number = Date.now()
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// 业务错误：用户可恢复的错误
export class BusinessError extends BaseError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}

// 系统错误：需要运维介入的错误
export class SystemError extends BaseError {
  constructor(
    message: string,
    code: string,
    public originalError?: Error
  ) {
    super(message, code);
  }
}

// 第三方错误：外部服务错误
export class ExternalServiceError extends BaseError {
  constructor(
    public service: string,
    message: string,
    code: string,
    public statusCode?: number
  ) {
    super(message, code);
  }
}

// API相关错误
export class ApiError extends ExternalServiceError {
  constructor(
    message: string,
    code: string,
    statusCode?: number,
    public endpoint?: string
  ) {
    super('QWeatherAPI', message, code, statusCode);
  }
}

// 网络错误
export class NetworkError extends SystemError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR', originalError);
  }
}

// 超时错误
export class TimeoutError extends SystemError {
  constructor(message: string = '请求超时') {
    super(message, 'TIMEOUT_ERROR');
  }
}

// 验证错误
export class ValidationError extends BusinessError {
  constructor(
    public field: string,
    public value: any,
    message: string
  ) {
    super(message, 'VALIDATION_ERROR');
  }
}

// 错误码定义
export const ERROR_CODES = {
  // API错误码
  API_KEY_INVALID: 'API_KEY_INVALID',
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  API_RESPONSE_INVALID: 'API_RESPONSE_INVALID',
  API_RATE_LIMIT: 'API_RATE_LIMIT',
  
  // 网络错误码
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 数据错误码
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  DATA_INVALID: 'DATA_INVALID',
  
  // 城市相关错误码
  CITY_NOT_FOUND: 'CITY_NOT_FOUND',
  LOCATION_PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',
  LOCATION_UNAVAILABLE: 'LOCATION_UNAVAILABLE',
} as const;
```

**验收标准**:
- [ ] 错误类继承关系正确
- [ ] 错误分类清晰（业务、系统、第三方）
- [ ] 错误码使用 UPPER_SNAKE_CASE

---

### 步骤 3.4：创建HTTP客户端

**适用规范**: 
- 安全规范 [规则 7] API安全
- 错误处理规范 [规则 6] 错误恢复策略
- 错误处理规范 [规则 11] 超时和限流处理

**创建 src/services/http-client.ts**:

```typescript
import { API_REQUEST_CONFIG } from '@/config/api-config';
import { ApiError, NetworkError, TimeoutError, ERROR_CODES } from '@/utils/errors';

/**
 * HTTP客户端
 * 实现超时、重试和错误处理机制
 * 遵循安全规范：API安全、超时和限流处理
 */

export interface HttpRequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultTimeout = API_REQUEST_CONFIG.TIMEOUT;
    this.defaultRetries = API_REQUEST_CONFIG.RETRY_TIMES;
  }

  /**
   * GET 请求
   * 遵循命名约定：方法名使用 camelCase
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    options?: HttpRequestOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.fetchWithRetry<T>(url, {
      method: 'GET',
      headers: options?.headers,
    }, options);
  }

  /**
   * POST 请求
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: HttpRequestOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.fetchWithRetry<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
    }, options);
  }

  /**
   * 带重试的fetch请求
   * 实现指数退避策略
   */
  private async fetchWithRetry<T>(
    url: string,
    init: RequestInit,
    options?: HttpRequestOptions
  ): Promise<T> {
    const maxRetries = options?.retries ?? this.defaultRetries;
    const timeout = options?.timeout ?? this.defaultTimeout;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, init, timeout);
        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error as Error;
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries - 1) {
          const delay = this.calculateBackoffDelay(attempt);
          console.warn(`请求失败，${delay}ms后进行第 ${attempt + 2} 次重试...`);
          await this.sleep(delay);
        }
      }
    }
    
    throw new ApiError(
      `请求失败，已重试 ${maxRetries} 次`,
      ERROR_CODES.API_REQUEST_FAILED,
      undefined,
      url
    );
  }

  /**
   * 带超时的fetch请求
   */
  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      
      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new TimeoutError(`请求超时（${timeout}ms）`);
      }
      throw new NetworkError('网络请求失败', error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new ApiError(
        `HTTP错误: ${response.status} ${response.statusText}`,
        ERROR_CODES.API_REQUEST_FAILED,
        response.status
      );
    }
    
    try {
      const data = await response.json();
      return data as T;
    } catch (error) {
      throw new ApiError(
        '响应数据解析失败',
        ERROR_CODES.API_RESPONSE_INVALID
      );
    }
  }

  /**
   * 构建URL
   */
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number>
  ): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  /**
   * 计算指数退避延迟
   */
  private calculateBackoffDelay(attempt: number): number {
    const baseDelay = 1000; // 1秒
    return baseDelay * Math.pow(2, attempt);
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**验收标准**:
- [ ] 实现超时机制
- [ ] 实现重试机制（指数退避）
- [ ] 错误处理完整
- [ ] 方法命名符合规范

---

### 步骤 3.5：创建数据缓存管理器

**适用规范**: 命名约定 [约定 3] 类命名

**创建 src/utils/cache-manager.ts**:

```typescript
/**
 * 缓存管理器
 * 遵循命名约定：类名使用 PascalCase
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private defaultDuration: number;

  constructor(defaultDuration: number = 1800000) { // 30分钟
    this.cache = new Map();
    this.defaultDuration = defaultDuration;
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, duration?: number): void {
    const timestamp = Date.now();
    const ttl = duration ?? this.defaultDuration;
    
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt: timestamp + ttl,
    });
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清除过期缓存
   */
  clearExpired(): number {
    const now = Date.now();
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size;
  }
}
```

**验收标准**:
- [ ] 类名使用 PascalCase
- [ ] 方法名使用 camelCase
- [ ] 缓存过期机制正常
- [ ] 支持自定义过期时间

---

### 步骤 3.6：创建TypeScript类型定义

**适用规范**: 命名约定 [约定 10] 类型/接口命名

**创建 src/types/weather.ts**:

```typescript
/**
 * 天气相关类型定义
 * 遵循命名约定：接口和类型使用 PascalCase
 */

// 和风天气API通用响应
export interface QWeatherResponse<T> {
  code: string;
  updateTime?: string;
  fxLink?: string;
  [key: string]: T | string | undefined;
}

// 当前天气数据
export interface CurrentWeather {
  obsTime: string;       // 数据观测时间
  temp: string;          // 温度，默认单位：摄氏度
  feelsLike: string;     // 体感温度
  icon: string;          // 天气状况图标代码
  text: string;          // 天气状况文字描述
  wind360: string;       // 风向360角度
  windDir: string;       // 风向
  windScale: string;     // 风力等级
  windSpeed: string;     // 风速，公里/小时
  humidity: string;      // 相对湿度，百分比数值
  precip: string;        // 当前小时累计降水量，毫米
  pressure: string;      // 大气压强，百帕
  vis: string;           // 能见度，公里
  cloud: string;         // 云量，百分比数值
  dew: string;           // 露点温度
}

// 天气预报数据
export interface WeatherForecast {
  fxDate: string;        // 预报日期
  sunrise: string;       // 日出时间
  sunset: string;        // 日落时间
  moonrise: string;      // 月升时间
  moonset: string;       // 月落时间
  moonPhase: string;     // 月相名称
  tempMax: string;       // 预报当天最高温度
  tempMin: string;       // 预报当天最低温度
  iconDay: string;       // 白天天气状况图标代码
  textDay: string;       // 白天天气状况文字描述
  iconNight: string;     // 夜间天气状况图标代码
  textNight: string;     // 夜间天气状况文字描述
  wind360Day: string;    // 白天风向360角度
  windDirDay: string;    // 白天风向
  windScaleDay: string;  // 白天风力等级
  windSpeedDay: string;  // 白天风速
  wind360Night: string;  // 夜间风向360角度
  windDirNight: string;  // 夜间风向
  windScaleNight: string;// 夜间风力等级
  windSpeedNight: string;// 夜间风速
  humidity: string;      // 相对湿度
  precip: string;        // 预报当天总降水量
  pressure: string;      // 大气压强
  vis: string;           // 能见度
  cloud: string;         // 云量
  uvIndex: string;       // 紫外线强度指数
}

// 逐小时天气预报
export interface HourlyWeather {
  fxTime: string;        // 预报时间
  temp: string;          // 温度
  icon: string;          // 天气状况图标代码
  text: string;          // 天气状况文字描述
  wind360: string;       // 风向360角度
  windDir: string;       // 风向
  windScale: string;     // 风力等级
  windSpeed: string;     // 风速
  humidity: string;      // 相对湿度
  pop: string;           // 降水概率，百分比数值
  precip: string;        // 当前小时累计降水量
  pressure: string;      // 大气压强
  cloud: string;         // 云量
  dew: string;           // 露点温度
}

// 空气质量数据
export interface AirQuality {
  pubTime: string;       // 数据发布时间
  aqi: string;           // 空气质量指数
  level: string;         // 空气质量指数等级
  category: string;      // 空气质量指数级别
  primary: string;       // 空气质量的主要污染物
  pm10: string;          // PM10
  pm2p5: string;         // PM2.5
  no2: string;           // 二氧化氮
  so2: string;           // 二氧化硫
  co: string;            // 一氧化碳
  o3: string;            // 臭氧
}
```

**创建 src/types/city.ts**:

```typescript
/**
 * 城市相关类型定义
 */

// 城市信息
export interface CityInfo {
  id: string;            // Location ID
  name: string;          // 地区/城市名称
  lat: string;           // 地区/城市纬度
  lon: string;           // 地区/城市经度
  adm2: string;          // 地区/城市的上级行政区划名称
  adm1: string;          // 地区/城市所属一级行政区域
  country: string;       // 地区/城市所属国家名称
  tz: string;            // 地区/城市所在时区
  utcOffset: string;     // 地区/城市目前与UTC时间偏移的小时数
  isDst: string;         // 地区/城市是否当前处于夏令时
  type: string;          // 地区/城市的属性
  rank: string;          // 地区评分
  fxLink: string;        // 该地区的天气预报网页链接
}

// 城市搜索请求参数
export interface CitySearchParams {
  location: string;      // 搜索关键词
  adm?: string;          // 行政区划
  range?: 'world' | 'cn' | 'us' | 'eu';
  number?: number;       // 返回结果数量，1-20
  lang?: 'zh' | 'en';    // 多语言
}

// 地理位置坐标
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}
```

**验收标准**:
- [ ] 接口名使用 PascalCase
- [ ] 类型定义完整
- [ ] 注释清晰
- [ ] 与API文档保持一致

---

### 步骤 3.7：创建天气服务

**适用规范**: 
- 开发需求规范 [规则 6] 验证所有API是否存在
- 命名约定 [约定 2] 函数命名

**创建 src/services/weather-service.ts**:

```typescript
import { HttpClient } from './http-client';
import { CacheManager } from '@/utils/cache-manager';
import { QWEATHER_API_CONFIG, API_REQUEST_CONFIG } from '@/config/api-config';
import type {
  QWeatherResponse,
  CurrentWeather,
  WeatherForecast,
  HourlyWeather,
} from '@/types/weather';

/**
 * 天气服务类
 * 遵循命名约定：类名使用 PascalCase，方法名使用 camelCase
 */
export class WeatherService {
  private httpClient: HttpClient;
  private cacheManager: CacheManager;

  constructor() {
    this.httpClient = new HttpClient(QWEATHER_API_CONFIG.BASE_URL);
    this.cacheManager = new CacheManager(API_REQUEST_CONFIG.CACHE_DURATION);
  }

  /**
   * 获取当前天气
   * 遵循安全规范：使用HTTPS，设置超时
   */
  async getCurrentWeather(
    locationId: string,
    forceRefresh: boolean = false
  ): Promise<CurrentWeather> {
    const cacheKey = `current_weather_${locationId}`;
    
    // 检查缓存
    if (!forceRefresh) {
      const cached = this.cacheManager.get<CurrentWeather>(cacheKey);
      if (cached) {
        console.log('从缓存获取当前天气数据');
        return cached;
      }
    }
    
    // 调用API
    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_API_CONFIG.VERSION}${QWEATHER_API_CONFIG.ENDPOINTS.CURRENT_WEATHER}`,
      {
        location: locationId,
        key: API_REQUEST_CONFIG.API_KEY,
      }
    );
    
    if (response.code !== '200') {
      throw new Error(`API错误: ${response.code}`);
    }
    
    const weatherData = response.now as CurrentWeather;
    
    // 缓存数据（30分钟）
    this.cacheManager.set(cacheKey, weatherData, 30 * 60 * 1000);
    
    return weatherData;
  }

  /**
   * 获取7天天气预报
   */
  async getWeatherForecast(
    locationId: string,
    forceRefresh: boolean = false
  ): Promise<WeatherForecast[]> {
    const cacheKey = `forecast_7d_${locationId}`;
    
    if (!forceRefresh) {
      const cached = this.cacheManager.get<WeatherForecast[]>(cacheKey);
      if (cached) {
        console.log('从缓存获取天气预报数据');
        return cached;
      }
    }
    
    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_API_CONFIG.VERSION}${QWEATHER_API_CONFIG.ENDPOINTS.FORECAST_7D}`,
      {
        location: locationId,
        key: API_REQUEST_CONFIG.API_KEY,
      }
    );
    
    if (response.code !== '200') {
      throw new Error(`API错误: ${response.code}`);
    }
    
    const forecastData = response.daily as WeatherForecast[];
    
    // 缓存数据（2小时）
    this.cacheManager.set(cacheKey, forecastData, 2 * 60 * 60 * 1000);
    
    return forecastData;
  }

  /**
   * 获取24小时逐小时预报
   */
  async getHourlyForecast(
    locationId: string,
    forceRefresh: boolean = false
  ): Promise<HourlyWeather[]> {
    const cacheKey = `forecast_24h_${locationId}`;
    
    if (!forceRefresh) {
      const cached = this.cacheManager.get<HourlyWeather[]>(cacheKey);
      if (cached) {
        console.log('从缓存获取逐小时预报数据');
        return cached;
      }
    }
    
    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_API_CONFIG.VERSION}${QWEATHER_API_CONFIG.ENDPOINTS.FORECAST_24H}`,
      {
        location: locationId,
        key: API_REQUEST_CONFIG.API_KEY,
      }
    );
    
    if (response.code !== '200') {
      throw new Error(`API错误: ${response.code}`);
    }
    
    const hourlyData = response.hourly as HourlyWeather[];
    
    // 缓存数据（1小时）
    this.cacheManager.set(cacheKey, hourlyData, 60 * 60 * 1000);
    
    return hourlyData;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cacheManager.clear();
    console.log('天气数据缓存已清除');
  }
}
```

**验收标准**:
- [ ] 类名使用 PascalCase
- [ ] 方法名使用 camelCase
- [ ] 实现缓存机制
- [ ] 错误处理完整

---

## 📊 阶段验收清单（下半部分请看文档末尾）

### API集成验收
- [ ] 环境变量配置正确
- [ ] API密钥管理安全
- [ ] HTTP客户端功能完整
- [ ] 缓存机制正常工作

### 代码质量验收
- [ ] 遵循命名约定规范
- [ ] 错误分类清晰
- [ ] 类型定义完整
- [ ] 注释和文档齐全

---

**文档版本**: v1.0  
**更新日期**: 2024-01-01  
**维护团队**: 天气鸭开发团队

*注：由于文档较长，步骤3.8-3.12 和完整的验收清单请见文档下一部分*
