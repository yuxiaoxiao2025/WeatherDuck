# 天气鸭项目开发指导 - 阶段3：天气数据集成和API对接(下)

## 📋 继续步骤

本文档接续《03-天气数据集成和API对接(上).md》

---

### 步骤 3.8：创建城市服务

**适用规范**: 开发需求规范 [规则 6] 验证所有API是否存在

**创建 src/services/city-service.ts**:

```typescript
import { HttpClient } from './http-client';
import { CacheManager } from '@/utils/cache-manager';
import { QWEATHER_GEO_CONFIG, API_REQUEST_CONFIG } from '@/config/api-config';
import { ApiError, ERROR_CODES } from '@/utils/errors';
import type { QWeatherResponse } from '@/types/weather';
import type { CityInfo, CitySearchParams, GeoLocation } from '@/types/city';

/**
 * 城市服务类
 * 提供城市搜索和地理定位功能
 */
export class CityService {
  private httpClient: HttpClient;
  private cacheManager: CacheManager;

  constructor() {
    this.httpClient = new HttpClient(QWEATHER_GEO_CONFIG.BASE_URL);
    this.cacheManager = new CacheManager();
  }

  /**
   * 搜索城市
   * 遵循命名约定：方法名使用 camelCase，动词开头
   */
  async searchCities(params: CitySearchParams): Promise<CityInfo[]> {
    const cacheKey = `city_search_${params.location}_${params.adm || ''}`;
    
    // 检查缓存
    const cached = this.cacheManager.get<CityInfo[]>(cacheKey);
    if (cached) {
      console.log('从缓存获取城市搜索结果');
      return cached;
    }
    
    // 调用GeoAPI
    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_GEO_CONFIG.VERSION}${QWEATHER_GEO_CONFIG.ENDPOINTS.CITY_LOOKUP}`,
      {
        location: params.location,
        key: API_REQUEST_CONFIG.API_KEY,
        adm: params.adm,
        range: params.range || 'cn',
        number: params.number || 10,
        lang: params.lang || 'zh',
      }
    );
    
    if (response.code !== '200') {
      throw new ApiError(
        `城市搜索失败: ${response.code}`,
        ERROR_CODES.API_REQUEST_FAILED,
        undefined,
        QWEATHER_GEO_CONFIG.ENDPOINTS.CITY_LOOKUP
      );
    }
    
    const cities = response.location as CityInfo[];
    
    if (!cities || cities.length === 0) {
      throw new ApiError(
        '未找到匹配的城市',
        ERROR_CODES.CITY_NOT_FOUND
      );
    }
    
    // 缓存结果（1小时）
    this.cacheManager.set(cacheKey, cities, 60 * 60 * 1000);
    
    return cities;
  }

  /**
   * 获取热门城市列表
   */
  async getTopCities(
    range: 'world' | 'cn' = 'cn',
    number: number = 20
  ): Promise<CityInfo[]> {
    const cacheKey = `top_cities_${range}_${number}`;
    
    const cached = this.cacheManager.get<CityInfo[]>(cacheKey);
    if (cached) {
      console.log('从缓存获取热门城市列表');
      return cached;
    }
    
    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_GEO_CONFIG.VERSION}${QWEATHER_GEO_CONFIG.ENDPOINTS.CITY_TOP}`,
      {
        key: API_REQUEST_CONFIG.API_KEY,
        range,
        number,
        lang: 'zh',
      }
    );
    
    if (response.code !== '200') {
      throw new ApiError(
        `获取热门城市失败: ${response.code}`,
        ERROR_CODES.API_REQUEST_FAILED
      );
    }
    
    const cities = response.topCityList as CityInfo[];
    
    // 缓存结果（24小时）
    this.cacheManager.set(cacheKey, cities, 24 * 60 * 60 * 1000);
    
    return cities;
  }

  /**
   * 根据经纬度查询城市
   */
  async getCityByCoordinates(location: GeoLocation): Promise<CityInfo> {
    const locationStr = `${location.longitude},${location.latitude}`;
    const cacheKey = `city_coords_${locationStr}`;
    
    const cached = this.cacheManager.get<CityInfo>(cacheKey);
    if (cached) {
      console.log('从缓存获取坐标城市信息');
      return cached;
    }
    
    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_GEO_CONFIG.VERSION}${QWEATHER_GEO_CONFIG.ENDPOINTS.CITY_LOOKUP}`,
      {
        location: locationStr,
        key: API_REQUEST_CONFIG.API_KEY,
        lang: 'zh',
      }
    );
    
    if (response.code !== '200') {
      throw new ApiError(
        `根据坐标查询城市失败: ${response.code}`,
        ERROR_CODES.API_REQUEST_FAILED
      );
    }
    
    const cities = response.location as CityInfo[];
    
    if (!cities || cities.length === 0) {
      throw new ApiError(
        '未找到对应的城市',
        ERROR_CODES.CITY_NOT_FOUND
      );
    }
    
    const city = cities[0];
    
    // 缓存结果（6小时）
    this.cacheManager.set(cacheKey, city, 6 * 60 * 60 * 1000);
    
    return city;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cacheManager.clear();
    console.log('城市数据缓存已清除');
  }
}
```

**验收标准**:
- [ ] 城市搜索功能正常
- [ ] 热门城市获取正常
- [ ] 坐标查询功能正常
- [ ] 缓存机制工作正常

---

### 步骤 3.9：创建地理定位服务

**适用规范**: 错误处理规范 [规则 6] 错误恢复策略

**创建 src/services/geolocation-service.ts**:

```typescript
import { ApiError, ERROR_CODES } from '@/utils/errors';
import type { GeoLocation } from '@/types/city';

/**
 * 地理定位服务
 * 基于浏览器 Geolocation API
 */
export class GeolocationService {
  private options: PositionOptions;

  constructor() {
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };
  }

  /**
   * 获取当前位置
   * 遵循错误处理规范：提供明确的错误信息
   */
  async getCurrentPosition(): Promise<GeoLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new ApiError(
          '浏览器不支持地理定位功能',
          ERROR_CODES.LOCATION_UNAVAILABLE
        ));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let errorCode: string;
          let errorMessage: string;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorCode = ERROR_CODES.LOCATION_PERMISSION_DENIED;
              errorMessage = '用户拒绝了地理定位权限';
              break;
            case error.POSITION_UNAVAILABLE:
              errorCode = ERROR_CODES.LOCATION_UNAVAILABLE;
              errorMessage = '无法获取位置信息';
              break;
            case error.TIMEOUT:
              errorCode = ERROR_CODES.TIMEOUT_ERROR;
              errorMessage = '获取位置信息超时';
              break;
            default:
              errorCode = ERROR_CODES.LOCATION_UNAVAILABLE;
              errorMessage = '未知的定位错误';
          }

          reject(new ApiError(errorMessage, errorCode));
        },
        this.options
      );
    });
  }

  /**
   * 检查地理定位权限
   */
  async checkPermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch {
      return 'prompt';
    }
  }

  /**
   * 判断是否支持地理定位
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }
}
```

**验收标准**:
- [ ] 地理定位功能正常
- [ ] 权限检查正常
- [ ] 错误处理完整
- [ ] 超时机制正常

---

### 步骤 3.10：创建服务统一导出

**适用规范**: 开发需求规范 [规则 2] 复用现有代码和API

**创建 src/services/index.ts**:

```typescript
/**
 * 服务层统一导出
 */

export { WeatherService } from './weather-service';
export { CityService } from './city-service';
export { GeolocationService } from './geolocation-service';
export { HttpClient } from './http-client';
```

**验收标准**:
- [ ] 所有服务统一导出
- [ ] 导入路径简洁
- [ ] 便于维护和使用

---

### 步骤 3.11：编写服务层测试

**适用规范**: 测试规范 [规则 1] 测试完整性

**创建 src/services/weather-service.test.ts**:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeatherService } from './weather-service';

// Mock HttpClient
vi.mock('./http-client', () => ({
  HttpClient: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue({
      code: '200',
      now: {
        obsTime: '2024-01-01T12:00+08:00',
        temp: '18',
        feelsLike: '16',
        icon: '100',
        text: '晴',
        wind360: '90',
        windDir: '东风',
        windScale: '3',
        windSpeed: '15',
        humidity: '62',
        precip: '0.0',
        pressure: '1013',
        vis: '10',
        cloud: '25',
        dew: '12',
      },
    }),
  })),
}));

describe('WeatherService', () => {
  let weatherService: WeatherService;

  beforeEach(() => {
    weatherService = new WeatherService();
  });

  it('should get current weather successfully', async () => {
    const weather = await weatherService.getCurrentWeather('101020300');
    
    expect(weather).toBeDefined();
    expect(weather.temp).toBe('18');
    expect(weather.text).toBe('晴');
  });

  it('should use cache for repeated requests', async () => {
    const weather1 = await weatherService.getCurrentWeather('101020300');
    const weather2 = await weatherService.getCurrentWeather('101020300');
    
    expect(weather1).toEqual(weather2);
  });

  it('should force refresh when requested', async () => {
    const weather1 = await weatherService.getCurrentWeather('101020300', false);
    const weather2 = await weatherService.getCurrentWeather('101020300', true);
    
    expect(weather1).toBeDefined();
    expect(weather2).toBeDefined();
  });
});
```

**创建 src/services/city-service.test.ts**:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CityService } from './city-service';

vi.mock('./http-client', () => ({
  HttpClient: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue({
      code: '200',
      location: [
        {
          id: '101020300',
          name: '宝山区',
          lat: '31.40123',
          lon: '121.48941',
          adm2: '上海',
          adm1: '上海市',
          country: '中国',
          tz: 'Asia/Shanghai',
          utcOffset: '+08:00',
          isDst: '0',
          type: 'city',
          rank: '25',
          fxLink: 'https://www.qweather.com/weather/baoshan-101020300.html',
        },
      ],
    }),
  })),
}));

describe('CityService', () => {
  let cityService: CityService;

  beforeEach(() => {
    cityService = new CityService();
  });

  it('should search cities successfully', async () => {
    const cities = await cityService.searchCities({
      location: '宝山',
    });
    
    expect(cities).toBeDefined();
    expect(cities.length).toBeGreaterThan(0);
    expect(cities[0].name).toBe('宝山区');
  });

  it('should get city by coordinates', async () => {
    const city = await cityService.getCityByCoordinates({
      latitude: 31.40123,
      longitude: 121.48941,
    });
    
    expect(city).toBeDefined();
    expect(city.name).toBe('宝山区');
  });
});
```

**运行测试**:

```powershell
npm run test
```

**验收标准**:
- [ ] 测试覆盖核心功能
- [ ] 测试用例命名清晰
- [ ] 使用Mock隔离外部依赖
- [ ] 所有测试通过

---

### 步骤 3.12：创建测试页面验证API集成

**适用规范**: 开发需求规范 [规则 1] 生成完整可运行代码

**更新 src/App.tsx**:

```typescript
import React, { useState, useEffect } from 'react';
import { AppContainer, Header } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { WeatherService } from '@/services/weather-service';
import { CityService } from '@/services/city-service';
import { GeolocationService } from '@/services/geolocation-service';
import { validateApiConfig } from '@/config/api-config';
import type { CurrentWeather } from '@/types/weather';
import type { CityInfo } from '@/types/city';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState<CityInfo | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [error, setError] = useState<string>('');
  
  const weatherService = new WeatherService();
  const cityService = new CityService();
  const geoService = new GeolocationService();

  useEffect(() => {
    // 验证API配置
    if (!validateApiConfig()) {
      setError('API配置错误，请检查环境变量');
    }
  }, []);

  /**
   * 获取当前位置的天气
   */
  const handleGetLocationWeather = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // 1. 获取地理位置
      const position = await geoService.getCurrentPosition();
      console.log('当前位置:', position);
      
      // 2. 根据坐标查询城市
      const city = await cityService.getCityByCoordinates(position);
      console.log('当前城市:', city);
      setCurrentCity(city);
      
      // 3. 获取天气数据
      const weather = await weatherService.getCurrentWeather(city.id);
      console.log('当前天气:', weather);
      setCurrentWeather(weather);
      
    } catch (err: any) {
      console.error('获取天气失败:', err);
      setError(err.message || '获取天气信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 搜索城市天气
   */
  const handleSearchCity = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // 搜索城市（示例：北京）
      const cities = await cityService.searchCities({
        location: '北京',
        range: 'cn',
      });
      
      if (cities.length > 0) {
        const city = cities[0];
        console.log('搜索到城市:', city);
        setCurrentCity(city);
        
        // 获取天气数据
        const weather = await weatherService.getCurrentWeather(city.id);
        console.log('城市天气:', weather);
        setCurrentWeather(weather);
      }
      
    } catch (err: any) {
      console.error('搜索城市失败:', err);
      setError(err.message || '搜索城市失败');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 刷新天气
   */
  const handleRefresh = async () => {
    if (!currentCity) {
      setError('请先选择城市');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const weather = await weatherService.getCurrentWeather(
        currentCity.id,
        true // 强制刷新
      );
      console.log('刷新天气:', weather);
      setCurrentWeather(weather);
    } catch (err: any) {
      console.error('刷新失败:', err);
      setError(err.message || '刷新失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContainer>
      <Header 
        title="天气鸭"
        subtitle="API集成测试"
        onRefresh={currentWeather ? handleRefresh : undefined}
      />
      
      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* 测试按钮 */}
        <Card variant="glass">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            API功能测试
          </h3>
          
          <div className="space-y-2">
            <Button 
              variant="primary" 
              className="w-full"
              leftIcon={<Icon name="MapPin" size={18} />}
              onClick={handleGetLocationWeather}
              isLoading={isLoading}
            >
              获取当前位置天气
            </Button>
            
            <Button 
              variant="secondary" 
              className="w-full"
              leftIcon={<Icon name="Search" size={18} />}
              onClick={handleSearchCity}
              isLoading={isLoading}
            >
              搜索城市（北京）
            </Button>
          </div>
        </Card>

        {/* 错误信息 */}
        {error && (
          <Card variant="elevated" className="bg-red-50 border-2 border-red-200">
            <div className="flex items-start space-x-3">
              <Icon name="AlertCircle" size={20} color="#ef4444" />
              <div>
                <h4 className="font-bold text-red-900">错误</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* 城市信息 */}
        {currentCity && (
          <Card variant="glass">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-blue-900">
                <Icon name="MapPin" size={20} className="inline mr-2" />
                {currentCity.name}
              </h3>
              <span className="text-sm text-blue-600">
                {currentCity.adm1}
              </span>
            </div>
            <p className="text-xs text-blue-500">
              ID: {currentCity.id} | 经纬度: {currentCity.lon}, {currentCity.lat}
            </p>
          </Card>
        )}

        {/* 天气信息 */}
        {currentWeather && (
          <Card variant="glass">
            <h3 className="text-lg font-bold text-blue-900 mb-3">
              当前天气
            </h3>
            
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-blue-900">
                {currentWeather.temp}°C
              </div>
              <div className="text-xl text-blue-600 mt-2">
                {currentWeather.text}
              </div>
              <div className="text-sm text-blue-500 mt-1">
                体感温度: {currentWeather.feelsLike}°C
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Icon name="Droplets" size={18} color="#3b82f6" />
                <div>
                  <div className="text-xs text-blue-600">湿度</div>
                  <div className="font-bold text-blue-900">
                    {currentWeather.humidity}%
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Icon name="Wind" size={18} color="#3b82f6" />
                <div>
                  <div className="text-xs text-blue-600">风速</div>
                  <div className="font-bold text-blue-900">
                    {currentWeather.windSpeed}km/h
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Icon name="Gauge" size={18} color="#3b82f6" />
                <div>
                  <div className="text-xs text-blue-600">气压</div>
                  <div className="font-bold text-blue-900">
                    {currentWeather.pressure}hPa
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Icon name="Eye" size={18} color="#3b82f6" />
                <div>
                  <div className="text-xs text-blue-600">能见度</div>
                  <div className="font-bold text-blue-900">
                    {currentWeather.vis}km
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-500">
              更新时间: {new Date(currentWeather.obsTime).toLocaleString('zh-CN')}
            </div>
          </Card>
        )}
      </main>
    </AppContainer>
  );
}

export default App;
```

**运行测试**:

```powershell
# 启动开发服务器
npm run dev:web

# 在浏览器访问 http://localhost:3000
# 测试功能：
# 1. 点击"获取当前位置天气" - 测试地理定位和天气API
# 2. 点击"搜索城市（北京）" - 测试城市搜索和天气API
# 3. 点击顶部刷新按钮 - 测试强制刷新功能
```

**验收标准**:
- [ ] 地理定位功能正常
- [ ] 城市搜索功能正常
- [ ] 天气数据获取正常
- [ ] 错误处理正确显示
- [ ] UI交互流畅

---

## 📊 阶段验收清单

### API集成验收
- [ ] 和风天气API配置正确
- [ ] GeoAPI配置正确
- [ ] 环境变量管理安全
- [ ] API密钥不泄露

### 服务层验收
- [ ] WeatherService 功能完整
- [ ] CityService 功能完整
- [ ] GeolocationService 功能完整
- [ ] HttpClient 功能完整
- [ ] CacheManager 功能完整

### 错误处理验收
- [ ] 自定义错误类完整
- [ ] 错误分类清晰
- [ ] 超时机制正常
- [ ] 重试机制正常
- [ ] 错误恢复策略正确

### 代码质量验收
- [ ] 遵循命名约定规范
- [ ] TypeScript类型定义完整
- [ ] 注释清晰完整
- [ ] 测试覆盖核心功能

### 安全规范验收
- [ ] API密钥安全管理
- [ ] 使用HTTPS协议
- [ ] 超时配置合理
- [ ] 错误信息不泄露敏感数据

---

## 🔍 常见问题解决

### Q1: API请求返回401错误
**原因**: API密钥无效或未配置  
**解决方案**:
```powershell
# 1. 检查.env文件是否存在
# 2. 确认API密钥正确
# 3. 重启开发服务器
```

### Q2: 地理定位权限被拒绝
**原因**: 用户拒绝了浏览器定位权限  
**解决方案**:
- 检查浏览器地址栏的权限图标
- 手动允许定位权限
- 或使用城市搜索功能

### Q3: 缓存数据不刷新
**原因**: 缓存未过期  
**解决方案**:
```typescript
// 使用强制刷新参数
await weatherService.getCurrentWeather(cityId, true);

// 或清除缓存
weatherService.clearCache();
```

### Q4: CORS跨域错误
**原因**: 和风天气API可能有跨域限制  
**解决方案**:
- 确认使用的是开发环境API（devapi.qweather.com）
- 如果是生产环境，考虑使用反向代理

---

## 📝 下一步

完成本阶段后，请继续阅读：
- **阶段4：核心功能实现 - 天气组件**
- **阶段5：核心功能实现 - 时钟和报时**

---

**文档版本**: v1.0  
**更新日期**: 2024-01-01  
**维护团队**: 天气鸭开发团队
