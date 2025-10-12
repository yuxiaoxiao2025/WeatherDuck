// 应用状态和设置相关类型定义

export type Platform = 'web' | 'electron';

export type Theme = 'light' | 'dark' | 'auto';

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';

export type PressureUnit = 'mb' | 'inHg' | 'kPa';

export type VisibilityUnit = 'km' | 'miles';

export interface AppSettings {
  theme: Theme;
  language: string;
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  pressureUnit: PressureUnit;
  visibilityUnit: VisibilityUnit;
  autoRefresh: boolean;
  refreshInterval: number; // 分钟
  showNotifications: boolean;
  showAlerts: boolean;
  defaultLocation?: string;
  favoriteLocations: string[];
  showHourlyForecast: boolean;
  showDailyForecast: boolean;
  forecastDays: number;
  animationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
  platform: Platform;
  isOnline: boolean;
  lastSync: string | null;
  settings: AppSettings;
  currentLocation: string | null;
  favoriteLocations: string[];
}

export interface UserPreferences {
  theme: Theme;
  language: string;
  units: {
    temperature: TemperatureUnit;
    windSpeed: WindSpeedUnit;
    pressure: PressureUnit;
    visibility: VisibilityUnit;
  };
  notifications: {
    enabled: boolean;
    alerts: boolean;
    updates: boolean;
  };
  display: {
    showHourlyForecast: boolean;
    showDailyForecast: boolean;
    forecastDays: number;
    animationsEnabled: boolean;
  };
  location: {
    autoDetect: boolean;
    defaultLocation?: string;
    favorites: string[];
  };
  refresh: {
    auto: boolean;
    interval: number;
  };
}

// Context相关类型
export interface AppContextType {
  state: AppState;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOnlineStatus: (online: boolean) => void;
  addFavoriteLocation: (location: string) => void;
  removeFavoriteLocation: (location: string) => void;
  setCurrentLocation: (location: string | null) => void;
}

export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export type ErrorCode = 
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'LOCATION_ERROR'
  | 'STORAGE_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

// 通知类型
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  persistent?: boolean;
}

// 存储相关类型
export interface StorageData {
  settings: AppSettings;
  favoriteLocations: string[];
  weatherCache: Record<string, any>;
  lastSync: string;
}

export type StorageKey = keyof StorageData;