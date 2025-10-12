import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Theme } from '../types';

/**
 * 主题Hook
 * 管理应用的主题状态和切换
 */
export function useTheme() {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>('theme', 'auto');
  const [isDark, setIsDark] = useState(false);

  // 检测系统主题偏好
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // 应用主题到DOM
  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  // 计算实际主题
  const getEffectiveTheme = useCallback((theme: Theme): 'light' | 'dark' => {
    if (theme === 'auto') {
      return getSystemTheme();
    }
    return theme;
  }, [getSystemTheme]);

  // 设置主题
  const setTheme = useCallback((theme: Theme) => {
    setStoredTheme(theme);
    const effectiveTheme = getEffectiveTheme(theme);
    applyTheme(effectiveTheme);
  }, [setStoredTheme, getEffectiveTheme, applyTheme]);

  // 切换主题
  const toggleTheme = useCallback(() => {
    const newTheme: Theme = storedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [storedTheme, setTheme]);

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (storedTheme === 'auto') {
        const systemTheme = getSystemTheme();
        applyTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [storedTheme, getSystemTheme, applyTheme]);

  // 初始化主题
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(storedTheme);
    applyTheme(effectiveTheme);
  }, [storedTheme, getEffectiveTheme, applyTheme]);

  return {
    theme: storedTheme,
    isDark,
    setTheme,
    toggleTheme,
    systemTheme: getSystemTheme(),
    effectiveTheme: getEffectiveTheme(storedTheme),
  };
}

/**
 * 主题类名Hook
 * 根据当前主题返回相应的CSS类名
 */
export function useThemeClasses() {
  const { isDark } = useTheme();

  const getThemeClass = useCallback((lightClass: string, darkClass: string) => {
    return isDark ? darkClass : lightClass;
  }, [isDark]);

  const getConditionalClass = useCallback((condition: boolean, trueClass: string, falseClass: string = '') => {
    return condition ? trueClass : falseClass;
  }, []);

  return {
    isDark,
    getThemeClass,
    getConditionalClass,
    // 常用主题类名
    bg: isDark ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    borderSecondary: isDark ? 'border-gray-600' : 'border-gray-300',
    hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  };
}