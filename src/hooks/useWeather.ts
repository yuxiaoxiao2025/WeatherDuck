import { useState, useEffect, useCallback } from 'react';
import { WeatherData, LocationSearchResult, ForecastData, HourlyForecast, WeatherAlert } from '../types';
import { weatherService } from '../services/WeatherService';

export interface UseWeatherState {
  weatherData: WeatherData | null;
  forecast: ForecastData[];
  hourlyForecast: HourlyForecast[];
  alerts: WeatherAlert[];
  searchResults: LocationSearchResult[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface UseWeatherActions {
  getCurrentWeather: (location: string) => Promise<void>;
  getForecast: (location: string, days?: number) => Promise<void>;
  getHourlyForecast: (location: string) => Promise<void>;
  getCompleteWeatherData: (location: string) => Promise<void>;
  searchLocations: (query: string) => Promise<void>;
  getWeatherAlerts: (location: string) => Promise<void>;
  clearError: () => void;
  clearSearchResults: () => void;
  refreshWeatherData: () => Promise<void>;
}

export interface UseWeatherReturn extends UseWeatherState, UseWeatherActions {}

export const useWeather = (defaultLocation?: string): UseWeatherReturn => {
  const [state, setState] = useState<UseWeatherState>({
    weatherData: null,
    forecast: [],
    hourlyForecast: [],
    alerts: [],
    searchResults: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const [currentLocation, setCurrentLocation] = useState<string>(defaultLocation || '');

  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<UseWeatherState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 错误处理辅助函数
  const handleError = useCallback((error: any, action: string) => {
    console.error(`${action} 失败:`, error);
    const errorMessage = error instanceof Error ? error.message : `${action}失败`;
    updateState({ error: errorMessage, loading: false });
  }, [updateState]);

  // 获取当前天气
  const getCurrentWeather = useCallback(async (location: string) => {
    try {
      updateState({ loading: true, error: null });
      const weatherData = await weatherService.getCurrentWeather(location);
      setCurrentLocation(location);
      updateState({
        weatherData,
        loading: false,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      handleError(error, '获取当前天气');
    }
  }, [updateState, handleError]);

  // 获取天气预报
  const getForecast = useCallback(async (location: string, days: number = 7) => {
    try {
      updateState({ loading: true, error: null });
      const forecast = await weatherService.getForecast(location, days);
      setCurrentLocation(location);
      updateState({
        forecast,
        loading: false,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      handleError(error, '获取天气预报');
    }
  }, [updateState, handleError]);

  // 获取小时预报
  const getHourlyForecast = useCallback(async (location: string) => {
    try {
      updateState({ loading: true, error: null });
      const hourlyForecast = await weatherService.getHourlyForecast(location);
      setCurrentLocation(location);
      updateState({
        hourlyForecast,
        loading: false,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      handleError(error, '获取小时预报');
    }
  }, [updateState, handleError]);

  // 获取完整天气数据
  const getCompleteWeatherData = useCallback(async (location: string) => {
    try {
      updateState({ loading: true, error: null });
      const weatherData = await weatherService.getCompleteWeatherData(location);
      const alerts = await weatherService.getWeatherAlerts(location);
      setCurrentLocation(location);
      updateState({
        weatherData,
        forecast: weatherData.forecast,
        alerts,
        loading: false,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      handleError(error, '获取完整天气数据');
    }
  }, [updateState, handleError]);

  // 搜索位置
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      updateState({ searchResults: [] });
      return;
    }

    try {
      updateState({ loading: true, error: null });
      const searchResults = await weatherService.searchCities(query);
      updateState({
        searchResults,
        loading: false,
      });
    } catch (error) {
      handleError(error, '搜索位置');
    }
  }, [updateState, handleError]);

  // 获取天气预警
  const getWeatherAlerts = useCallback(async (location: string) => {
    try {
      const alerts = await weatherService.getWeatherAlerts(location);
      updateState({ alerts });
    } catch (error) {
      console.warn('获取天气预警失败:', error);
      // 预警失败不影响主要功能，只记录警告
    }
  }, [updateState]);

  // 清除错误
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // 清除搜索结果
  const clearSearchResults = useCallback(() => {
    updateState({ searchResults: [] });
  }, [updateState]);

  // 刷新天气数据
  const refreshWeatherData = useCallback(async () => {
    if (currentLocation) {
      await getCompleteWeatherData(currentLocation);
    }
  }, [currentLocation, getCompleteWeatherData]);

  // 自动加载默认位置的天气数据
  useEffect(() => {
    if (defaultLocation) {
      getCompleteWeatherData(defaultLocation);
    }
  }, [defaultLocation, getCompleteWeatherData]);

  return {
    // 状态
    weatherData: state.weatherData,
    forecast: state.forecast,
    hourlyForecast: state.hourlyForecast,
    alerts: state.alerts,
    searchResults: state.searchResults,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    // 操作
    getCurrentWeather,
    getForecast,
    getHourlyForecast,
    getCompleteWeatherData,
    searchLocations,
    getWeatherAlerts,
    clearError,
    clearSearchResults,
    refreshWeatherData,
  };
};

export default useWeather;