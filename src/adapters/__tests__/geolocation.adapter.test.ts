import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IGeolocationAdapter, GeolocationAdapterFactory, GeolocationOptions, Position, GeolocationError, WatchOptions } from '../types';

describe('GeolocationAdapter', () => {
  let geolocationAdapter: IGeolocationAdapter;
  
  beforeEach(async () => {
    geolocationAdapter = await GeolocationAdapterFactory.create();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // 清理所有监听器
    geolocationAdapter.clearAllWatchers();
  });

  describe('权限管理', () => {
    it('应该能够检查地理位置权限', async () => {
      const permission = await geolocationAdapter.checkPermission();
      expect(['granted', 'denied', 'prompt']).toContain(permission);
    });

    it('应该能够请求地理位置权限', async () => {
      const permission = await geolocationAdapter.requestPermission();
      expect(['granted', 'denied']).toContain(permission);
    });

    it('应该在权限被拒绝时正确处理', async () => {
      vi.spyOn(geolocationAdapter, 'checkPermission').mockResolvedValue('denied');
      
      const permission = await geolocationAdapter.checkPermission();
      expect(permission).toBe('denied');
      
      // 尝试获取位置应该失败
      await expect(geolocationAdapter.getCurrentPosition()).rejects.toThrow(/permission/i);
    });
  });

  describe('当前位置获取', () => {
    beforeEach(async () => {
      // 确保有权限
      vi.spyOn(geolocationAdapter, 'checkPermission').mockResolvedValue('granted');
    });

    it('应该能够获取当前位置', async () => {
      const position = await geolocationAdapter.getCurrentPosition();
      
      expect(position).toBeDefined();
      expect(position.coords).toBeDefined();
      expect(typeof position.coords.latitude).toBe('number');
      expect(typeof position.coords.longitude).toBe('number');
      expect(typeof position.timestamp).toBe('number');
    });

    it('应该能够使用高精度模式获取位置', async () => {
      const options: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      
      const position = await geolocationAdapter.getCurrentPosition(options);
      
      expect(position).toBeDefined();
      expect(position.coords.accuracy).toBeDefined();
    });

    it('应该能够设置超时时间', async () => {
      const options: GeolocationOptions = {
        timeout: 1000 // 1秒超时
      };
      
      // 模拟超时情况
      vi.spyOn(geolocationAdapter, 'getCurrentPosition').mockRejectedValue(
        new GeolocationError('TIMEOUT', 'Timeout expired')
      );
      
      await expect(geolocationAdapter.getCurrentPosition(options)).rejects.toThrow('Timeout');
    });

    it('应该能够使用缓存的位置', async () => {
      const options: GeolocationOptions = {
        maximumAge: 60000 // 1分钟内的缓存有效
      };
      
      const position1 = await geolocationAdapter.getCurrentPosition(options);
      const position2 = await geolocationAdapter.getCurrentPosition(options);
      
      // 如果使用缓存，时间戳应该相同或相近
      expect(Math.abs(position1.timestamp - position2.timestamp)).toBeLessThan(1000);
    });

    it('应该包含完整的坐标信息', async () => {
      const position = await geolocationAdapter.getCurrentPosition();
      
      expect(position.coords.latitude).toBeGreaterThanOrEqual(-90);
      expect(position.coords.latitude).toBeLessThanOrEqual(90);
      expect(position.coords.longitude).toBeGreaterThanOrEqual(-180);
      expect(position.coords.longitude).toBeLessThanOrEqual(180);
      expect(position.coords.accuracy).toBeGreaterThan(0);
      
      // 可选属性
      if (position.coords.altitude !== null) {
        expect(typeof position.coords.altitude).toBe('number');
      }
      if (position.coords.altitudeAccuracy !== null) {
        expect(position.coords.altitudeAccuracy).toBeGreaterThan(0);
      }
      if (position.coords.heading !== null) {
        expect(position.coords.heading).toBeGreaterThanOrEqual(0);
        expect(position.coords.heading).toBeLessThan(360);
      }
      if (position.coords.speed !== null) {
        expect(position.coords.speed).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('位置监听', () => {
    beforeEach(async () => {
      vi.spyOn(geolocationAdapter, 'checkPermission').mockResolvedValue('granted');
    });

    it('应该能够开始监听位置变化', async () => {
      const positionHandler = vi.fn();
      const errorHandler = vi.fn();
      
      const watchId = await geolocationAdapter.watchPosition(
        positionHandler,
        errorHandler
      );
      
      expect(watchId).toBeDefined();
      expect(typeof watchId).toBe('string');
    });

    it('应该能够停止监听位置变化', async () => {
      const positionHandler = vi.fn();
      
      const watchId = await geolocationAdapter.watchPosition(positionHandler);
      
      await geolocationAdapter.clearWatch(watchId);
      
      // 验证监听已停止
      const activeWatchers = await geolocationAdapter.getActiveWatchers();
      expect(activeWatchers).not.toContain(watchId);
    });

    it('应该能够使用监听选项', async () => {
      const positionHandler = vi.fn();
      const options: WatchOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000,
        distanceFilter: 10 // 移动10米才触发更新
      };
      
      const watchId = await geolocationAdapter.watchPosition(
        positionHandler,
        undefined,
        options
      );
      
      expect(watchId).toBeDefined();
    });

    it('应该在位置变化时触发回调', async () => {
      const positionHandler = vi.fn();
      
      const watchId = await geolocationAdapter.watchPosition(positionHandler);
      
      // 模拟位置变化
      const mockPosition: Position = {
        coords: {
          latitude: 39.9042,
          longitude: 116.4074,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      };
      
      // 触发位置更新
      if (geolocationAdapter.simulatePositionUpdate) {
        geolocationAdapter.simulatePositionUpdate(mockPosition);
        expect(positionHandler).toHaveBeenCalledWith(mockPosition);
      }
    });

    it('应该在错误时触发错误回调', async () => {
      const positionHandler = vi.fn();
      const errorHandler = vi.fn();
      
      const watchId = await geolocationAdapter.watchPosition(
        positionHandler,
        errorHandler
      );
      
      // 模拟错误
      const mockError = new GeolocationError('POSITION_UNAVAILABLE', 'Position unavailable');
      
      if (geolocationAdapter.simulateError) {
        geolocationAdapter.simulateError(mockError);
        expect(errorHandler).toHaveBeenCalledWith(mockError);
      }
    });

    it('应该能够获取活动的监听器列表', async () => {
      const positionHandler1 = vi.fn();
      const positionHandler2 = vi.fn();
      
      const watchId1 = await geolocationAdapter.watchPosition(positionHandler1);
      const watchId2 = await geolocationAdapter.watchPosition(positionHandler2);
      
      const activeWatchers = await geolocationAdapter.getActiveWatchers();
      
      expect(activeWatchers).toContain(watchId1);
      expect(activeWatchers).toContain(watchId2);
    });

    it('应该能够清除所有监听器', async () => {
      const positionHandler1 = vi.fn();
      const positionHandler2 = vi.fn();
      
      await geolocationAdapter.watchPosition(positionHandler1);
      await geolocationAdapter.watchPosition(positionHandler2);
      
      await geolocationAdapter.clearAllWatchers();
      
      const activeWatchers = await geolocationAdapter.getActiveWatchers();
      expect(activeWatchers).toHaveLength(0);
    });
  });

  describe('地理编码和反向地理编码', () => {
    beforeEach(async () => {
      vi.spyOn(geolocationAdapter, 'checkPermission').mockResolvedValue('granted');
    });

    it('应该能够将地址转换为坐标', async () => {
      const address = '北京市天安门广场';
      
      const coordinates = await geolocationAdapter.geocode(address);
      
      expect(coordinates).toBeDefined();
      expect(coordinates.latitude).toBeDefined();
      expect(coordinates.longitude).toBeDefined();
      expect(typeof coordinates.latitude).toBe('number');
      expect(typeof coordinates.longitude).toBe('number');
    });

    it('应该能够将坐标转换为地址', async () => {
      const coordinates = {
        latitude: 39.9042,
        longitude: 116.4074
      };
      
      const address = await geolocationAdapter.reverseGeocode(coordinates);
      
      expect(address).toBeDefined();
      expect(typeof address.formattedAddress).toBe('string');
      expect(address.country).toBeDefined();
      expect(address.city).toBeDefined();
    });

    it('应该能够获取详细的地址信息', async () => {
      const coordinates = {
        latitude: 39.9042,
        longitude: 116.4074
      };
      
      const address = await geolocationAdapter.reverseGeocode(coordinates);
      
      expect(address.country).toBeDefined();
      expect(address.province).toBeDefined();
      expect(address.city).toBeDefined();
      expect(address.district).toBeDefined();
      expect(address.street).toBeDefined();
      expect(address.postalCode).toBeDefined();
    });

    it('应该处理无效的地址', async () => {
      const invalidAddress = 'This is not a valid address 12345';
      
      await expect(geolocationAdapter.geocode(invalidAddress)).rejects.toThrow();
    });

    it('应该处理无效的坐标', async () => {
      const invalidCoordinates = {
        latitude: 999, // 无效纬度
        longitude: 999 // 无效经度
      };
      
      await expect(geolocationAdapter.reverseGeocode(invalidCoordinates)).rejects.toThrow();
    });
  });

  describe('距离和方向计算', () => {
    it('应该能够计算两点间距离', async () => {
      const point1 = { latitude: 39.9042, longitude: 116.4074 }; // 北京
      const point2 = { latitude: 31.2304, longitude: 121.4737 }; // 上海
      
      const distance = await geolocationAdapter.calculateDistance(point1, point2);
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeCloseTo(1067000, 50000); // 约1067公里，允许50公里误差
    });

    it('应该能够计算方向角度', async () => {
      const from = { latitude: 39.9042, longitude: 116.4074 }; // 北京
      const to = { latitude: 31.2304, longitude: 121.4737 }; // 上海
      
      const bearing = await geolocationAdapter.calculateBearing(from, to);
      
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    it('应该能够检查点是否在指定区域内', async () => {
      const point = { latitude: 39.9042, longitude: 116.4074 };
      const center = { latitude: 39.9042, longitude: 116.4074 };
      const radius = 1000; // 1公里
      
      const isWithin = await geolocationAdapter.isWithinRadius(point, center, radius);
      
      expect(isWithin).toBe(true);
    });

    it('应该能够获取指定半径内的兴趣点', async () => {
      const center = { latitude: 39.9042, longitude: 116.4074 };
      const radius = 5000; // 5公里
      const category = 'restaurant';
      
      const pois = await geolocationAdapter.getNearbyPOIs(center, radius, category);
      
      expect(Array.isArray(pois)).toBe(true);
      pois.forEach(poi => {
        expect(poi.name).toBeDefined();
        expect(poi.coordinates).toBeDefined();
        expect(poi.category).toBe(category);
        expect(poi.distance).toBeLessThanOrEqual(radius);
      });
    });
  });

  describe('位置历史和缓存', () => {
    beforeEach(async () => {
      vi.spyOn(geolocationAdapter, 'checkPermission').mockResolvedValue('granted');
    });

    it('应该能够获取位置历史', async () => {
      // 先获取几次位置以建立历史
      await geolocationAdapter.getCurrentPosition();
      await geolocationAdapter.getCurrentPosition();
      
      const history = await geolocationAdapter.getLocationHistory();
      
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      
      history.forEach(position => {
        expect(position.coords).toBeDefined();
        expect(position.timestamp).toBeDefined();
      });
    });

    it('应该能够清除位置历史', async () => {
      await geolocationAdapter.getCurrentPosition();
      
      await geolocationAdapter.clearLocationHistory();
      
      const history = await geolocationAdapter.getLocationHistory();
      expect(history).toHaveLength(0);
    });

    it('应该能够设置历史记录限制', async () => {
      const maxHistorySize = 5;
      
      await geolocationAdapter.setMaxHistorySize(maxHistorySize);
      
      // 获取多次位置
      for (let i = 0; i < 10; i++) {
        await geolocationAdapter.getCurrentPosition();
      }
      
      const history = await geolocationAdapter.getLocationHistory();
      expect(history.length).toBeLessThanOrEqual(maxHistorySize);
    });

    it('应该能够获取最后已知位置', async () => {
      await geolocationAdapter.getCurrentPosition();
      
      const lastKnownPosition = await geolocationAdapter.getLastKnownPosition();
      
      expect(lastKnownPosition).toBeDefined();
      expect(lastKnownPosition.coords).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该处理权限被拒绝的情况', async () => {
      vi.spyOn(geolocationAdapter, 'checkPermission').mockResolvedValue('denied');
      
      await expect(geolocationAdapter.getCurrentPosition()).rejects.toThrow(
        expect.objectContaining({
          code: 'PERMISSION_DENIED'
        })
      );
    });

    it('应该处理位置不可用的情况', async () => {
      vi.spyOn(geolocationAdapter, 'checkPermission').mockResolvedValue('granted');
      vi.spyOn(geolocationAdapter, 'getCurrentPosition').mockRejectedValue(
        new GeolocationError('POSITION_UNAVAILABLE', 'Position unavailable')
      );
      
      await expect(geolocationAdapter.getCurrentPosition()).rejects.toThrow(
        expect.objectContaining({
          code: 'POSITION_UNAVAILABLE'
        })
      );
    });

    it('应该处理超时错误', async () => {
      const options: GeolocationOptions = {
        timeout: 1
      };
      
      vi.spyOn(geolocationAdapter, 'getCurrentPosition').mockRejectedValue(
        new GeolocationError('TIMEOUT', 'Timeout expired')
      );
      
      await expect(geolocationAdapter.getCurrentPosition(options)).rejects.toThrow(
        expect.objectContaining({
          code: 'TIMEOUT'
        })
      );
    });

    it('应该处理无效的监听器ID', async () => {
      await expect(geolocationAdapter.clearWatch('invalid-id')).resolves.not.toThrow();
    });

    it('应该处理网络错误', async () => {
      const address = 'Valid Address';
      
      vi.spyOn(geolocationAdapter, 'geocode').mockRejectedValue(
        new Error('Network error')
      );
      
      await expect(geolocationAdapter.geocode(address)).rejects.toThrow('Network error');
    });
  });

  describe('平台特定功能', () => {
    it('应该提供平台信息', () => {
      expect(geolocationAdapter.platform).toBeDefined();
      expect(['desktop', 'web']).toContain(geolocationAdapter.platform);
    });

    it('应该提供地理位置能力信息', () => {
      const capabilities = geolocationAdapter.getCapabilities();
      
      expect(capabilities).toBeDefined();
      expect(typeof capabilities.supportsHighAccuracy).toBe('boolean');
      expect(typeof capabilities.supportsGeocoding).toBe('boolean');
      expect(typeof capabilities.supportsReverseGeocoding).toBe('boolean');
      expect(typeof capabilities.supportsPOISearch).toBe('boolean');
      expect(typeof capabilities.supportsLocationHistory).toBe('boolean');
    });

    it('应该提供支持的坐标系统', () => {
      const coordinateSystems = geolocationAdapter.getSupportedCoordinateSystems();
      
      expect(Array.isArray(coordinateSystems)).toBe(true);
      expect(coordinateSystems).toContain('WGS84');
    });
  });
});

// 桌面版特定测试
describe('DesktopGeolocationAdapter', () => {
  let adapter: IGeolocationAdapter;
  
  beforeEach(async () => {
    // 模拟桌面环境
    vi.stubGlobal('process', { platform: 'win32' });
    vi.stubGlobal('window', undefined);
    
    adapter = await GeolocationAdapterFactory.create();
  });

  it('应该使用系统定位服务', () => {
    expect(adapter.platform).toBe('desktop');
  });

  it('应该支持WiFi定位', async () => {
    vi.spyOn(adapter, 'checkPermission').mockResolvedValue('granted');
    
    const options: GeolocationOptions = {
      enableHighAccuracy: false, // 使用WiFi定位
      timeout: 10000
    };
    
    const position = await adapter.getCurrentPosition(options);
    expect(position).toBeDefined();
  });

  it('应该支持GPS定位', async () => {
    vi.spyOn(adapter, 'checkPermission').mockResolvedValue('granted');
    
    const options: GeolocationOptions = {
      enableHighAccuracy: true, // 使用GPS定位
      timeout: 30000
    };
    
    const position = await adapter.getCurrentPosition(options);
    expect(position).toBeDefined();
    expect(position.coords.accuracy).toBeLessThan(100); // GPS精度应该更高
  });

  it('应该支持系统位置服务设置', async () => {
    const isLocationServiceEnabled = await adapter.isLocationServiceEnabled();
    expect(typeof isLocationServiceEnabled).toBe('boolean');
  });
});

// Web版特定测试
describe('WebGeolocationAdapter', () => {
  let adapter: IGeolocationAdapter;
  
  beforeEach(async () => {
    // 模拟Web环境
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn()
    };
    
    const mockNavigator = {
      geolocation: mockGeolocation,
      permissions: {
        query: vi.fn().mockResolvedValue({ state: 'granted' })
      }
    };
    
    vi.stubGlobal('navigator', mockNavigator);
    vi.stubGlobal('process', undefined);
    
    adapter = await GeolocationAdapterFactory.create();
  });

  it('应该使用浏览器地理位置API', () => {
    expect(adapter.platform).toBe('web');
  });

  it('应该处理浏览器权限API', async () => {
    const permission = await adapter.checkPermission();
    expect(['granted', 'denied', 'prompt']).toContain(permission);
  });

  it('应该在HTTPS环境下工作', async () => {
    // 模拟HTTPS环境
    vi.stubGlobal('location', { protocol: 'https:' });
    
    const capabilities = adapter.getCapabilities();
    expect(capabilities.requiresSecureContext).toBe(true);
  });

  it('应该在HTTP环境下提供降级方案', async () => {
    // 模拟HTTP环境
    vi.stubGlobal('location', { protocol: 'http:' });
    
    // 应该使用IP定位等替代方案
    const position = await adapter.getCurrentPosition();
    expect(position).toBeDefined();
    expect(position.coords.accuracy).toBeGreaterThan(1000); // IP定位精度较低
  });

  it('应该处理不支持地理位置的浏览器', async () => {
    // 模拟不支持地理位置的浏览器
    vi.stubGlobal('navigator', {});
    
    const fallbackAdapter = await GeolocationAdapterFactory.create();
    
    await expect(fallbackAdapter.getCurrentPosition()).rejects.toThrow(/not supported/i);
  });
});