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

#### 开发需求规范
文件路径: `.qoder/rules/requirements-spec.zh-CN.md`

- **[规则 1] 生成完整可运行代码** → 第20行
- **[规则 6] 验证所有API是否存在** → 第118行
- **[规则 7] 第一次就完全修复错误** → 第138行

#### 命名约定
文件路径: `.qoder/rules/naming-conventions.zh-CN.md`

- **[约定 1] 变量命名** → 第20行 (camelCase)
- **[约定 2] 函数命名** → 第54行 (camelCase, 动词开头)
- **[约定 3] 类命名** → 第90行 (PascalCase)
- **[约定 4] 常量命名** → 第118行 (UPPER_SNAKE_CASE)
- **[约定 9] 环境变量命名** → 第277行 (UPPER_SNAKE_CASE)

### 质量规范

#### 安全规范
文件路径: `.qoder/rules/security-spec.zh-CN.md`

- **[规则 8] 安全配置管理** → 第231行 (环境变量和API密钥管理)

#### 错误处理规范
文件路径: `.qoder/rules/error-handling-spec.zh-CN.md`

- **[规则 1] 错误分类体系** → 第20行
- **[规则 2] 自定义错误类** → 第91行
- **[规则 6] 错误恢复策略** → 第216行 (API重试机制)
- **[规则 11] 超时和限流处理** → 第457行

### 和风天气API参考文档

#### 和风天气错误码文档
文件路径: `和风天气错误码.md`

- **错误码v2版本** → 第8-95行
  - INVALID PARAMETER (400): 错误的参数
  - MISSING PARAMETER (400): 缺失参数
  - UNAUTHORIZED (401): 身份认证失败
  - NO CREDIT (403): 余额不足
  - RATE LIMIT (429): 请求过多
  - UNKNOWN ERROR (500): 服务故障

- **错误码v1版本** → 第116-128行
  - 200: 请求成功
  - 204: 请求成功但无数据
  - 400: 请求错误
  - 401: 认证失败
  - 402: 超过访问次数
  - 429: 超过QPM限制

- **错误处理要求** → 第6行
  - 妥善处理错误,暂停请求并排查
  - 避免持续错误请求导致账号冻结

#### 和风天气API KEY使用文档
文件路径: `和风天气的API KEY使用文档.md`

- **API KEY认证方式** → 第20-31行
  - 请求标头方式: X-QW-Api-Key: your-key
  - 请求参数方式: key=your-key

- **安全提示** → 第4行
  - 从2027年1月1日起限制API KEY每日请求数量

#### 和风天气优化请求文档
文件路径: `和风天气优化请求.md`

- **构建合法URL** → 第6-30行
  - URL编码规范(特殊字符、中文、空格)
  - 避免无效空格和中文符号混用

- **指数退避算法** → 第43-63行
  - 公式: t = b^c (t=等待时间, b=基数, c=错误次数)
  - 添加随机插槽避免冲突
  - 设置最大等待期(建议c=10)

- **错误处理最佳实践** → 第35-41行
  - 返回错误码时暂停请求
  - 排除故障后再继续
  - 避免大量失败请求被视为DDoS攻击

#### 和风天气GeoAPI文档
文件路径: `和风天气GeoAPI.md`

- **城市搜索API** → 第13-45行
  - 端点: /geo/v2/city/lookup
  - 支持模糊搜索和坐标查询
  - 行政区划过滤(adm参数)
  - 搜索范围设置(range参数)

- **返回数据结构** → 第47-227行
  - location.id: Location ID(查询天气必需)
  - location.name: 城市名称
  - location.lat/lon: 经纬度
  - location.adm1/adm2: 行政区划
  - location.rank: 地区评分

#### API_KEY配置指南
文件路径: `API_KEY_配置指南.md`

- **API Host配置** → 第125-126行
  - 免费订阅: api.qweather.com
  - 开发订阅: devapi.qweather.com

- **错误诊断** → 第3-6行
  - 检查API Key格式(32字符)
  - 验证应用类型配置
  - 检查API Host设置

---

## 🚀 实施步骤

### 步骤 3.1：配置环境变量和API密钥

**适用规范**: 
- 安全规范 [规则 8] 安全配置管理 → 第231行
  - 不在代码中硬编码密钥，使用环境变量管理API密钥
- 命名约定 [约定 9] 环境变量命名 (UPPER_SNAKE_CASE) → 第277行
  - 环境变量使用UPPER_SNAKE_CASE命名规范
- 开发需求规范 [规则 1] 生成完整可运行代码 → 第20行
  - 提供完整的.env配置示例，包含所有必要的环境变量

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
- [ ] 环境变量使用 VITE_ 前缀（Vite框架规范）
- [ ] 变量名使用 UPPER_SNAKE_CASE（约定9：环境变量命名）
- [ ] API密钥不硬编码在代码中（规则8：安全配置管理）
- [ ] .env 文件已在 .gitignore 中（规则8：不提交敏感信息到版本控制）
- [ ] 配置文件完整可用（规则1：生成完整可运行代码）

---

### 步骤 3.2：创建API配置和常量

**适用规范**: 
- 命名约定 [约定 4] 常量命名 → 第118行
  - 使用 UPPER_SNAKE_CASE 命名常量
- 开发需求规范 [规则 3] 最小化新增依赖 → 第69行
  - 优先使用项目现有依赖（复用Vite的环境变量系统）
- 开发需求规范 [规则 10] 确保代码成功编译 → 第171行
  - 验证API配置，确保代码可正常运行

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
- [ ] 所有常量使用 UPPER_SNAKE_CASE（约定4）
- [ ] 使用 as const 确保类型安全
- [ ] API配置验证函数正常工作（规则10：确保可运行）
- [ ] 复用Vite环境变量系统（规则3：最小化依赖）

---

### 步骤 3.3：创建自定义错误类

**适用规范**: 
- 错误处理规范 [规则 1] 错误分类体系 → 第20行
  - 建立清晰的错误分类：业务错误、系统错误、第三方错误
- 错误处理规范 [规则 2] 自定义错误类 → 第91行
  - 创建领域特定的错误类，继承标准Error类
- 命名约定 [约定 3] 类命名 (PascalCase) → 第90行
  - 错误类使用PascalCase命名
- 命名约定 [约定 4] 常量命名 (UPPER_SNAKE_CASE) → 第118行
  - 错误码常量使用UPPER_SNAKE_CASE命名

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
- [ ] 错误类继承关系正确（规则2：自定义错误类继承BaseError）
- [ ] 错误分类清晰（规则1：业务、系统、第三方错误分类）
- [ ] 错误码使用 UPPER_SNAKE_CASE（约定4：常量命名规范）
- [ ] 类名使用 PascalCase（约定3：BaseError、ApiError等）
- [ ] 错误类功能完整（规则1：包含必要的错误信息和上下文）

---

### 步骤 3.4：创建HTTP客户端

**适用规范**: 
- 错误处理规范 [规则 6] 错误恢复策略 → 第216行
  - 实施重试机制和指数退避策略
- 错误处理规范 [规则 11] 超时和限流处理 → 第457行
  - 所有外部调用设置超时，使用AbortController实现
- 命名约定 [约定 3] 类命名 (PascalCase) → 第90行
  - HttpClient类使用PascalCase
- 命名约定 [约定 2] 函数命名 (camelCase) → 第54行
  - 方法名使用camelCase，动词开头（get、post、fetchWithRetry等）
- 开发需求规范 [规则 1] 生成完整可运行代码 → 第20行
  - 提供完整的HTTP客户端实现，包含GET/POST方法

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
- [ ] 实现超时机制（规则11：使用AbortController，默认10秒）
- [ ] 实现重试机制（规则6：指数退避策略，最多3次重试）
- [ ] 错误处理完整（规则6：捕获网络错误、超时错误、API错误）
- [ ] 方法命名符合规范（约定2：get、post、fetchWithRetry使用camelCase）
- [ ] 类名符合规范（约定3：HttpClient使用PascalCase）
- [ ] 代码可立即运行（规则1：完整实现，无TODO）

---

### 步骤 3.5：创建数据缓存管理器

**适用规范**: 
- 命名约定 [约定 3] 类命名 (PascalCase) → 第90行
  - CacheManager类使用PascalCase
- 命名约定 [约定 2] 函数命名 (camelCase) → 第54行
  - 方法名使用camelCase（get、set、has、delete、clear等）
- 命名约定 [约定 10] 类型/接口命名 (PascalCase) → 第315行
  - CacheEntry接口使用PascalCase
- 开发需求规范 [规则 1] 生成完整可运行代码 → 第20行
  - 提供完整的缓存管理器实现
- 开发需求规范 [规则 9] 功能优先于完美 → 第163行
  - 先实现基本的缓存功能，使用简单的Map数据结构

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
- [ ] 类名使用 PascalCase（约定3：CacheManager）
- [ ] 方法名使用 camelCase（约定2：get、set、has等）
- [ ] 缓存过期机制正常（规则1：完整实现过期检查逻辑）
- [ ] 支持自定义过期时间（规则1：支持duration参数）
- [ ] 接口定义完整（约定10：CacheEntry接口使用PascalCase）
- [ ] 代码可立即使用（规则1：无占位符，功能完整）

---

### 步骤 3.6：创建TypeScript类型定义

**适用规范**: 
- 命名约定 [约定 10] 类型/接口命名 (PascalCase) → 第315行
  - 接口和类型使用PascalCase（QWeatherResponse、CurrentWeather等）
- 开发需求规范 [规则 6] 验证所有API是否存在 → 第118行
  - 根据和风天气官方API文档定义类型，确保字段准确
- 开发需求规范 [规则 1] 生成完整可运行代码 → 第20行
  - 提供完整的类型定义，覆盖所有API响应字段
- 命名约定 [约定 1] 变量命名 (camelCase) → 第20行
  - 接口属性使用camelCase（obsTime、feelsLike等）

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
- [ ] 接口名使用 PascalCase（约定10：CurrentWeather、WeatherForecast等）
- [ ] 类型定义完整（规则1：覆盖所有API响应字段，无缺失）
- [ ] 注释清晰（规则8：每个字段都有中文注释说明）
- [ ] 与API文档保持一致（规则6：根据和风天气官方文档定义）
- [ ] 属性命名符合规范（约定1：使用camelCase）
- [ ] 泛型类型定义正确（约定10：QWeatherResponse<T>）

---

### 步骤 3.7：创建天气服务

**适用规范**: 
- 开发需求规范 [规则 6] 验证所有API是否存在 → 第118行
  - 使用前验证API是否存在，检查响应code
- 开发需求规范 [规则 13] 只使用真实存在的库 → 第199行
  - 和风天气API已通过官方文档验证
- 命名约定 [约定 2] 函数命名 → 第54行
  - 方法名使用camelCase，动词开头

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
- [ ] 类名使用 PascalCase（约定3：WeatherService）
- [ ] 方法名使用 camelCase（约定2：getCurrentWeather、getWeatherForecast等动词开头）
- [ ] 实现缓存机制（规则2：复用CacheManager类）
- [ ] 错误处理完整（规则6：检查API响应code，处理错误情况）
- [ ] API验证正确（规则6：验证response.code是否为'200'）
- [ ] 使用真实API（规则13：和风天气API已通过官方文档验证）
- [ ] 代码可立即运行（规则1：完整实现，包含所有必要的import和配置）

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

---

## 📚 规范文件快速参考

本文档引用的所有规范条款详见:

| 规范类别 | 文件路径 | 规则编号 | 起始行 |
|---------|---------|---------|--------|
| 开发需求规范 | `.qoder/rules/requirements-spec.zh-CN.md` | 规则 1 | 第20行 |
| 开发需求规范 | `.qoder/rules/requirements-spec.zh-CN.md` | 规则 6 | 第118行 |
| 开发需求规范 | `.qoder/rules/requirements-spec.zh-CN.md` | 规则 7 | 第138行 |
| 命名约定 | `.qoder/rules/naming-conventions.zh-CN.md` | 约定 1 | 第20行 |
| 命名约定 | `.qoder/rules/naming-conventions.zh-CN.md` | 约定 2 | 第54行 |
| 命名约定 | `.qoder/rules/naming-conventions.zh-CN.md` | 约定 3 | 第90行 |
| 命名约定 | `.qoder/rules/naming-conventions.zh-CN.md` | 约定 4 | 第118行 |
| 命名约定 | `.qoder/rules/naming-conventions.zh-CN.md` | 约定 9 | 第277行 |
| 安全规范 | `.qoder/rules/security-spec.zh-CN.md` | 规则 8 | 第231行 |
| 错误处理规范 | `.qoder/rules/error-handling-spec.zh-CN.md` | 规则 1 | 第20行 |
| 错误处理规范 | `.qoder/rules/error-handling-spec.zh-CN.md` | 规则 2 | 第91行 |
| 错误处理规范 | `.qoder/rules/error-handling-spec.zh-CN.md` | 规则 6 | 第216行 |
| 错误处理规范 | `.qoder/rules/error-handling-spec.zh-CN.md` | 规则 11 | 第457行 |
| 和风天气错误码 | `和风天气错误码.md` | 错误码v2 | 第8-95行 |
| 和风天气错误码 | `和风天气错误码.md` | 错误码v1 | 第116-128行 |
| API KEY使用 | `和风天气的API KEY使用文档.md` | 认证方式 | 第20-31行 |
| 优化请求 | `和风天气优化请求.md` | URL编码 | 第6-30行 |
| 优化请求 | `和风天气优化请求.md` | 指数退避 | 第43-63行 |
| GeoAPI | `和风天气GeoAPI.md` | 城市搜索 | 第13-45行 |
| GeoAPI | `和风天气GeoAPI.md` | 返回数据 | 第47-227行 |
| API配置指南 | `API_KEY_配置指南.md` | Host配置 | 第125-126行 |

**使用方法**:
1. 在IDE中使用 `Ctrl+G` (或 `Cmd+G`) 跳转到指定行号
2. 或在Qoder中使用 `@文件路径` 直接打开规范文件

---

**文档版本**: v1.0  
**更新日期**: 2024-01-01  
**维护团队**: 天气鸭开发团队

*注:由于文档较长,步骤3.8-3.12 和完整的验收清单请见文档下一部分*
