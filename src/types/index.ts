// 类型定义入口文件

// 天气相关类型
export type {
  WeatherData,
  Location,
  CurrentWeather,
  WeatherCondition,
  ForecastData,
  DayForecast,
  HourlyForecast,
  AstroData,
  WeatherAlert,
  WeatherApiResponse,
  LocationSearchResult,
  SearchLocationParams,
} from './weather';

// 应用相关类型
export type {
  Platform,
  Theme,
  TemperatureUnit,
  WindSpeedUnit,
  PressureUnit,
  VisibilityUnit,
  AppSettings,
  AppState,
  UserPreferences,
  AppContextType,
  ThemeContextType,
  AppError,
  ErrorCode,
  Notification,
  StorageData,
  StorageKey,
} from './app';

// 导入Theme类型用于内部使用
import type { Theme } from './app';

// 组件相关类型
export type {
  BaseComponentProps,
  WeatherCardProps,
  CurrentWeatherProps,
  ForecastCardProps,
  LocationSearchProps,
  SearchResultProps,
  SettingsPanelProps,
  SettingsGroupProps,
  SettingsItemProps,
  ThemeToggleProps,
  LayoutProps,
  HeaderProps,
  SidebarProps,
  LoadingSpinnerProps,
  ErrorBoundaryProps,
  ErrorMessageProps,
  AnimatedContainerProps,
  WeatherIconProps,
  IconProps,
  ModalProps,
  NotificationProps,
  NotificationContainerProps,
  FormFieldProps,
  InputProps,
  SelectProps,
  ToggleProps,
  ChartProps,
  ResponsiveProps,
} from './components';

// 常用类型别名
export type ID = string;
export type Timestamp = string;
export type URL = string;
export type Color = string;
export type Size = 'small' | 'medium' | 'large';
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type Position = 'top' | 'bottom' | 'left' | 'right' | 'center';
export type Direction = 'horizontal' | 'vertical';
export type Alignment = 'start' | 'center' | 'end' | 'stretch';

// 工具类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 事件处理类型
export type EventHandler<T = void> = (event?: T) => void;
export type AsyncEventHandler<T = void> = (event?: T) => Promise<void>;
export type ChangeHandler<T> = (value: T) => void;
export type AsyncChangeHandler<T> = (value: T) => Promise<void>;

// API相关类型
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  status?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 配置相关类型
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  weather: {
    apiKey: string;
    defaultLocation: string;
    refreshInterval: number;
    cacheTimeout: number;
  };
  ui: {
    theme: Theme;
    animations: boolean;
    sounds: boolean;
  };
  storage: {
    prefix: string;
    version: string;
  };
}

// 环境变量类型
export interface EnvVars {
  NODE_ENV: 'development' | 'production' | 'test';
  VITE_API_BASE_URL: string;
  VITE_WEATHER_API_KEY: string;
  VITE_APP_VERSION: string;
  VITE_BUILD_TARGET: 'web' | 'electron';
}