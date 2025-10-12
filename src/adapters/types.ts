// 平台适配器类型定义和接口规范

// ============================================================================
// 通用类型定义
// ============================================================================

export type Platform = 'desktop' | 'web';

export interface AdapterCapabilities {
  [key: string]: boolean | string | number;
}

export interface BaseAdapter {
  readonly platform: Platform;
  getCapabilities(): AdapterCapabilities;
}

// ============================================================================
// 存储适配器类型定义
// ============================================================================

export interface IStorageAdapter extends BaseAdapter {
  // 基本存储操作
  set(key: string, value: any): Promise<void>;
  get<T = any>(key: string): Promise<T | undefined>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // 键管理
  keys(): Promise<string[]>;
  has(key: string): Promise<boolean>;
  size(): Promise<number>;
  
  // 批量操作
  setMultiple(items: Record<string, any>): Promise<void>;
  getMultiple<T = any>(keys: string[]): Promise<Record<string, T | undefined>>;
  removeMultiple(keys: string[]): Promise<void>;
  
  // 存储信息
  getStorageInfo(): Promise<StorageInfo>;
  
  // 事件监听
  onStorageChange(callback: (event: StorageChangeEvent) => void): () => void;
}

export interface StorageInfo {
  used: number;
  available: number;
  total: number;
  quota?: number;
}

export interface StorageChangeEvent {
  key: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

export interface StorageAdapterCapabilities extends AdapterCapabilities {
  maxKeyLength: number;
  maxValueSize: number;
  supportsTransactions: boolean;
  supportsIndexing: boolean;
  supportsBinaryData: boolean;
  supportsCompression: boolean;
  supportsEncryption: boolean;
}

// StorageAdapterFactory is exported from storage/index.ts
// This is just a type placeholder - the actual implementation is in storage.factory.ts

// ============================================================================
// 通知适配器类型定义
// ============================================================================

export interface INotificationAdapter extends BaseAdapter {
  // 权限管理
  requestPermission(): Promise<NotificationPermission>;
  getPermission(): Promise<NotificationPermission>;
  
  // 通知显示
  show(options: NotificationOptions): Promise<string>;
  
  // 通知管理
  close(id: string): Promise<void>;
  closeAll(): Promise<void>;
  getActive(): Promise<ActiveNotification[]>;
  
  // 事件处理
  onClick(callback: (event: NotificationClickEvent) => void): () => void;
  onClose(callback: (event: NotificationCloseEvent) => void): () => void;
  onAction(callback: (event: NotificationActionEvent) => void): () => void;
  onError(callback: (event: NotificationErrorEvent) => void): () => void;
}

export type NotificationPermission = 'granted' | 'denied' | 'default';

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  silent?: boolean;
  requireInteraction?: boolean;
  timeout?: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  category?: string;
  sound?: string;
  vibrate?: number[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface ActiveNotification {
  id: string;
  title: string;
  body?: string;
  tag?: string;
  timestamp: number;
}

export interface NotificationClickEvent {
  id: string;
  action?: string;
  data?: any;
}

export interface NotificationCloseEvent {
  id: string;
  reason: 'user' | 'timeout' | 'system';
}

export interface NotificationActionEvent {
  id: string;
  action: string;
  data?: any;
}

export interface NotificationErrorEvent {
  id: string;
  error: Error;
}

export interface NotificationAdapterCapabilities extends AdapterCapabilities {
  supportsActions: boolean;
  supportsImages: boolean;
  supportsSilent: boolean;
  supportsVibration: boolean;
  supportsSound: boolean;
  supportsPersistent: boolean;
  maxActions: number;
  maxTitleLength: number;
  maxBodyLength: number;
}

export class NotificationAdapterFactory {
  static async create(): Promise<INotificationAdapter> {
    throw new Error('NotificationAdapterFactory.create() must be implemented');
  }
}

// ============================================================================
// 音频适配器类型定义
// ============================================================================

export interface IAudioAdapter extends BaseAdapter {
  // 音频加载和播放
  load(url: string, options?: AudioLoadOptions): Promise<string>;
  play(id: string, options?: AudioPlayOptions): Promise<void>;
  pause(id: string): Promise<void>;
  resume(id: string): Promise<void>;
  stop(id: string): Promise<void>;
  
  // 音频控制
  setVolume(id: string, volume: number): Promise<void>;
  getVolume(id: string): Promise<number>;
  setMuted(id: string, muted: boolean): Promise<void>;
  isMuted(id: string): Promise<boolean>;
  seek(id: string, time: number): Promise<void>;
  getCurrentTime(id: string): Promise<number>;
  getDuration(id: string): Promise<number>;
  setPlaybackRate(id: string, rate: number): Promise<void>;
  getPlaybackRate(id: string): Promise<number>;
  
  // 音频状态
  getState(id: string): Promise<AudioState>;
  isLooping(id: string): Promise<boolean>;
  setLooping(id: string, loop: boolean): Promise<void>;
  
  // 多音频管理
  getActiveAudios(): Promise<string[]>;
  stopAll(): Promise<void>;
  pauseAll(): Promise<void>;
  resumeAll(): Promise<void>;
  setGlobalVolume(volume: number): Promise<void>;
  getGlobalVolume(): Promise<number>;
  
  // 音频效果
  fadeIn(id: string, duration: number): Promise<void>;
  fadeOut(id: string, duration: number): Promise<void>;
  crossfade(fromId: string, toId: string, duration: number): Promise<void>;
  
  // 音频信息
  getMetadata(id: string): Promise<AudioMetadata>;
  getBufferingProgress(id: string): Promise<number>;
  
  // 预加载和缓存
  preload(urls: string[]): Promise<void>;
  unload(id: string): Promise<void>;
  isCached(url: string): Promise<boolean>;
  getCacheSize(): Promise<number>;
  clearCache(): Promise<void>;
  
  // 事件处理
  onPlay(callback: (event: AudioPlayEvent) => void): () => void;
  onPause(callback: (event: AudioPauseEvent) => void): () => void;
  onEnded(callback: (event: AudioEndedEvent) => void): () => void;
  onError(callback: (event: AudioErrorEvent) => void): () => void;
  onVolumeChange(callback: (event: AudioVolumeChangeEvent) => void): () => void;
  onTimeUpdate(callback: (event: AudioTimeUpdateEvent) => void): () => void;
}

export interface AudioLoadOptions {
  preload?: boolean;
  loop?: boolean;
  volume?: number;
  autoplay?: boolean;
  crossOrigin?: string;
}

export interface AudioPlayOptions {
  startTime?: number;
  volume?: number;
  loop?: boolean;
  fadeIn?: number;
}

export type AudioState = 'loading' | 'loaded' | 'playing' | 'paused' | 'stopped' | 'error';

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  duration: number;
  format: string;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
}

export interface AudioPlayEvent {
  id: string;
  currentTime: number;
}

export interface AudioPauseEvent {
  id: string;
  currentTime: number;
}

export interface AudioEndedEvent {
  id: string;
  duration: number;
}

export interface AudioErrorEvent {
  id: string;
  error: Error;
}

export interface AudioVolumeChangeEvent {
  id: string;
  volume: number;
  muted: boolean;
}

export interface AudioTimeUpdateEvent {
  id: string;
  currentTime: number;
  duration: number;
}

export interface AudioAdapterCapabilities extends AdapterCapabilities {
  supportedFormats: string[];
  maxConcurrentAudios: number;
  supportsStreaming: boolean;
  supportsEffects: boolean;
  supports3D: boolean;
  supportsVisualization: boolean;
  supportsRecording: boolean;
  maxVolume: number;
  minVolume: number;
}

export class AudioAdapterFactory {
  static async create(): Promise<IAudioAdapter> {
    throw new Error('AudioAdapterFactory.create() must be implemented');
  }
}

// ============================================================================
// 窗口适配器类型定义
// ============================================================================

export interface IWindowAdapter extends BaseAdapter {
  // 窗口状态
  getState(): Promise<WindowState>;
  minimize(): Promise<void>;
  maximize(): Promise<void>;
  restore(): Promise<void>;
  hide(): Promise<void>;
  show(): Promise<void>;
  close(): Promise<void>;
  
  // 位置和大小
  getPosition(): Promise<WindowPosition>;
  setPosition(x: number, y: number): Promise<void>;
  getSize(): Promise<WindowSize>;
  setSize(width: number, height: number): Promise<void>;
  setBounds(bounds: WindowBounds): Promise<void>;
  center(): Promise<void>;
  
  // 窗口属性
  setTitle(title: string): Promise<void>;
  getTitle(): Promise<string>;
  setIcon(iconPath: string): Promise<void>;
  setOpacity(opacity: number): Promise<void>;
  getOpacity(): Promise<number>;
  setAlwaysOnTop(flag: boolean): Promise<void>;
  isAlwaysOnTop(): Promise<boolean>;
  setResizable(resizable: boolean): Promise<void>;
  isResizable(): Promise<boolean>;
  setMinimumSize(width: number, height: number): Promise<void>;
  setMaximumSize(width: number, height: number): Promise<void>;
  
  // 全屏和焦点
  setFullscreen(flag: boolean): Promise<void>;
  isFullscreen(): Promise<boolean>;
  focus(): Promise<void>;
  blur(): Promise<void>;
  isFocused(): Promise<boolean>;
  
  // 屏幕信息
  getScreenSize(): Promise<WindowSize>;
  getWorkAreaSize(): Promise<WindowSize>;
  getDisplays(): Promise<Display[]>;
  getPrimaryDisplay(): Promise<Display>;
  getCurrentDisplay(): Promise<Display>;
  
  // 窗口管理
  createWindow(options: WindowCreateOptions): Promise<string>;
  getAllWindows(): Promise<WindowInfo[]>;
  getActiveWindow(): Promise<WindowInfo | null>;
  switchToWindow(id: string): Promise<void>;
  
  // 截图和捕获
  captureWindow(): Promise<string>;
  captureRegion(bounds: WindowBounds): Promise<string>;
  
  // 事件处理
  onClose(callback: (event: WindowCloseEvent) => void): () => void;
  onResize(callback: (event: WindowResizeEvent) => void): () => void;
  onMove(callback: (event: WindowMoveEvent) => void): () => void;
  onStateChange(callback: (event: WindowStateChangeEvent) => void): () => void;
  onFocus(callback: (event: WindowFocusEvent) => void): () => void;
  onBlur(callback: (event: WindowBlurEvent) => void): () => void;
}

export type WindowState = 'normal' | 'minimized' | 'maximized' | 'fullscreen' | 'hidden';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowBounds extends WindowPosition, WindowSize {}

export interface Display {
  id: string;
  bounds: WindowBounds;
  workArea: WindowBounds;
  scaleFactor: number;
  rotation: number;
  isPrimary: boolean;
}

export interface WindowCreateOptions {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  title?: string;
  icon?: string;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  alwaysOnTop?: boolean;
  fullscreen?: boolean;
  show?: boolean;
  frame?: boolean;
  transparent?: boolean;
  opacity?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WindowInfo {
  id: string;
  title: string;
  bounds: WindowBounds;
  state: WindowState;
  isVisible: boolean;
  isFocused: boolean;
}

export interface WindowCloseEvent {
  id: string;
  canPrevent: boolean;
  preventDefault?: () => void;
}

export interface WindowResizeEvent {
  id: string;
  oldSize: WindowSize;
  newSize: WindowSize;
}

export interface WindowMoveEvent {
  id: string;
  oldPosition: WindowPosition;
  newPosition: WindowPosition;
}

export interface WindowStateChangeEvent {
  id: string;
  oldState: WindowState;
  newState: WindowState;
}

export interface WindowFocusEvent {
  id: string;
}

export interface WindowBlurEvent {
  id: string;
}

export interface WindowAdapterCapabilities extends AdapterCapabilities {
  supportsMultipleWindows: boolean;
  supportsTransparency: boolean;
  supportsFrameless: boolean;
  supportsAlwaysOnTop: boolean;
  supportsFullscreen: boolean;
  supportsCapture: boolean;
  supportsSystemTray: boolean;
  maxWindows: number;
  minWindowSize: WindowSize;
  maxWindowSize: WindowSize;
}

export class WindowAdapterFactory {
  static async create(): Promise<IWindowAdapter> {
    throw new Error('WindowAdapterFactory.create() must be implemented');
  }
}

// ============================================================================
// 地理位置适配器类型定义
// ============================================================================

export interface IGeolocationAdapter extends BaseAdapter {
  // 权限管理
  checkPermission(): Promise<GeolocationPermission>;
  requestPermission(): Promise<GeolocationPermission>;
  
  // 位置获取
  getCurrentPosition(options?: GeolocationOptions): Promise<Position>;
  watchPosition(
    successCallback: (position: Position) => void,
    errorCallback?: (error: GeolocationError) => void,
    options?: WatchOptions
  ): Promise<string>;
  clearWatch(watchId: string): Promise<void>;
  clearAllWatchers(): Promise<void>;
  getActiveWatchers(): Promise<string[]>;
  
  // 地理编码
  geocode(address: string): Promise<Coordinates>;
  reverseGeocode(coordinates: Coordinates): Promise<Address>;
  
  // 距离和方向计算
  calculateDistance(from: Coordinates, to: Coordinates): Promise<number>;
  calculateBearing(from: Coordinates, to: Coordinates): Promise<number>;
  isWithinRadius(point: Coordinates, center: Coordinates, radius: number): Promise<boolean>;
  
  // 兴趣点搜索
  getNearbyPOIs(center: Coordinates, radius: number, category?: string): Promise<POI[]>;
  
  // 位置历史
  getLocationHistory(): Promise<Position[]>;
  clearLocationHistory(): Promise<void>;
  setMaxHistorySize(size: number): Promise<void>;
  getLastKnownPosition(): Promise<Position | null>;
  
  // 系统服务
  isLocationServiceEnabled(): Promise<boolean>;
  
  // 测试辅助方法（仅在测试环境中可用）
  simulatePositionUpdate?(position: Position): void;
  simulateError?(error: GeolocationError): void;
}

export type GeolocationPermission = 'granted' | 'denied' | 'prompt';

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface WatchOptions extends GeolocationOptions {
  distanceFilter?: number; // 最小移动距离（米）才触发更新
}

export interface Position {
  coords: Coordinates;
  timestamp: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface Address {
  formattedAddress: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  streetNumber?: string;
  postalCode?: string;
  coordinates?: Coordinates;
}

export interface POI {
  id: string;
  name: string;
  category: string;
  coordinates: Coordinates;
  address?: string;
  distance: number;
  rating?: number;
  phone?: string;
  website?: string;
}

export class GeolocationError extends Error {
  constructor(
    public code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NETWORK_ERROR',
    message: string
  ) {
    super(message);
    this.name = 'GeolocationError';
  }
}

export interface GeolocationAdapterCapabilities extends AdapterCapabilities {
  supportsHighAccuracy: boolean;
  supportsGeocoding: boolean;
  supportsReverseGeocoding: boolean;
  supportsPOISearch: boolean;
  supportsLocationHistory: boolean;
  supportsWatching: boolean;
  requiresSecureContext: boolean;
  maxWatchers: number;
  minAccuracy: number;
  maxAccuracy: number;
}

export class GeolocationAdapterFactory {
  static async create(): Promise<IGeolocationAdapter> {
    throw new Error('GeolocationAdapterFactory.create() must be implemented');
  }
}

// ============================================================================
// 平台检测工具
// ============================================================================

export class PlatformDetector {
  static isDesktop(): boolean {
    return typeof window === 'undefined' || 
           (typeof process !== 'undefined' && process.versions?.electron);
  }
  
  static isWeb(): boolean {
    return typeof window !== 'undefined' && 
           typeof process === 'undefined';
  }
  
  static isElectron(): boolean {
    return typeof process !== 'undefined' && 
           process.versions?.electron !== undefined;
  }
  
  static getPlatform(): Platform {
    return this.isDesktop() ? 'desktop' : 'web';
  }
  
  static getEnvironmentInfo(): {
    platform: Platform;
    isElectron: boolean;
    userAgent?: string;
    nodeVersion?: string;
    electronVersion?: string;
  } {
    return {
      platform: this.getPlatform(),
      isElectron: this.isElectron(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      nodeVersion: typeof process !== 'undefined' ? process.version : undefined,
      electronVersion: typeof process !== 'undefined' ? process.versions?.electron : undefined
    };
  }
}

// ============================================================================
// 适配器注册表
// ============================================================================

export interface AdapterRegistry {
  storage: typeof StorageAdapterFactory;
  notification: typeof NotificationAdapterFactory;
  audio: typeof AudioAdapterFactory;
  window: typeof WindowAdapterFactory;
  geolocation: typeof GeolocationAdapterFactory;
}

export class AdapterManager {
  private static registry: Partial<AdapterRegistry> = {};
  
  static register<K extends keyof AdapterRegistry>(
    type: K,
    factory: AdapterRegistry[K]
  ): void {
    this.registry[type] = factory;
  }
  
  static async create<K extends keyof AdapterRegistry>(
    type: K
  ): Promise<
    K extends 'storage' ? IStorageAdapter :
    K extends 'notification' ? INotificationAdapter :
    K extends 'audio' ? IAudioAdapter :
    K extends 'window' ? IWindowAdapter :
    K extends 'geolocation' ? IGeolocationAdapter :
    never
  > {
    const factory = this.registry[type];
    if (!factory) {
      throw new Error(`Adapter factory for type '${type}' is not registered`);
    }
    
    return (factory as any).create();
  }
  
  static isRegistered<K extends keyof AdapterRegistry>(type: K): boolean {
    return this.registry[type] !== undefined;
  }
  
  static getRegisteredTypes(): (keyof AdapterRegistry)[] {
    return Object.keys(this.registry) as (keyof AdapterRegistry)[];
  }
}