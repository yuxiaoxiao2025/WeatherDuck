// 组件相关类型定义

import { ReactNode } from 'react';
import { WeatherData, CurrentWeather, ForecastData } from './weather';
import { Theme, TemperatureUnit } from './app';

// 基础组件Props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

// 天气卡片组件
export interface WeatherCardProps extends BaseComponentProps {
  weather: WeatherData;
  showDetails?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export interface CurrentWeatherProps extends BaseComponentProps {
  current: CurrentWeather;
  location: string;
  unit: TemperatureUnit;
}

export interface ForecastCardProps extends BaseComponentProps {
  forecast: ForecastData;
  unit: TemperatureUnit;
  showHourly?: boolean;
}

// 搜索组件
export interface LocationSearchProps extends BaseComponentProps {
  onLocationSelect: (location: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export interface SearchResultProps extends BaseComponentProps {
  results: Array<{
    id: string;
    name: string;
    region: string;
    country: string;
  }>;
  onSelect: (location: string) => void;
  loading?: boolean;
}

// 设置组件
export interface SettingsPanelProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SettingsGroupProps extends BaseComponentProps {
  title: string;
  description?: string;
}

export interface SettingsItemProps extends BaseComponentProps {
  label: string;
  description?: string;
  value: any;
  onChange: (value: any) => void;
  type: 'toggle' | 'select' | 'slider' | 'input';
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
}

// 主题组件
export interface ThemeToggleProps extends BaseComponentProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

// 布局组件
export interface LayoutProps extends BaseComponentProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
}

export interface HeaderProps extends BaseComponentProps {
  title?: string;
  showSearch?: boolean;
  showSettings?: boolean;
  onSearchClick?: () => void;
  onSettingsClick?: () => void;
}

export interface SidebarProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteLocations: string[];
  currentLocation: string | null;
  onLocationSelect: (location: string) => void;
}

// 加载和错误组件
export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export interface ErrorMessageProps extends BaseComponentProps {
  error: string | Error;
  onRetry?: () => void;
  showRetry?: boolean;
}

// 动画组件
export interface AnimatedContainerProps extends BaseComponentProps {
  animation?: 'fade' | 'slide' | 'scale' | 'bounce';
  duration?: number;
  delay?: number;
  trigger?: boolean;
}

// 图标组件
export interface WeatherIconProps extends BaseComponentProps {
  condition: string;
  size?: number;
  animated?: boolean;
}

export interface IconProps extends BaseComponentProps {
  name: string;
  size?: number;
  color?: string;
  onClick?: () => void;
}

// 模态框组件
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// 通知组件
export interface NotificationProps extends BaseComponentProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
  onClose?: () => void;
}

export interface NotificationContainerProps extends BaseComponentProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

// 表单组件
export interface FormFieldProps extends BaseComponentProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
}

export interface InputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export interface SelectProps extends FormFieldProps {
  value: any;
  onChange: (value: any) => void;
  options: Array<{ label: string; value: any }>;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export interface ToggleProps extends FormFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

// 图表组件
export interface ChartProps extends BaseComponentProps {
  data: any[];
  type: 'line' | 'bar' | 'area';
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
}

// 响应式组件
export interface ResponsiveProps {
  mobile?: ReactNode;
  tablet?: ReactNode;
  desktop?: ReactNode;
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}