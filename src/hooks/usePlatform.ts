import { useState, useEffect } from 'react';
import type { Platform } from '../types';

/**
 * 平台检测Hook
 * 检测当前运行环境是Web还是Electron
 */
export function usePlatform(): {
  platform: Platform;
  isElectron: boolean;
  isWeb: boolean;
  electronAPI: any;
} {
  const [platform, setPlatform] = useState<Platform>('web');

  useEffect(() => {
    // 检测是否在Electron环境中
    const isElectron = !!(
      typeof window !== 'undefined' &&
      window.electronAPI
    );

    setPlatform(isElectron ? 'electron' : 'web');
  }, []);

  return {
    platform,
    isElectron: platform === 'electron',
    isWeb: platform === 'web',
    electronAPI: typeof window !== 'undefined' ? window.electronAPI : null,
  };
}

/**
 * Electron API Hook
 * 提供类型安全的Electron API访问
 */
export function useElectronAPI() {
  const { isElectron, electronAPI } = usePlatform();

  const showMessageBox = async (options: {
    type?: 'info' | 'warning' | 'error' | 'question';
    title?: string;
    message: string;
    detail?: string;
    buttons?: string[];
  }) => {
    if (!isElectron || !electronAPI) {
      console.warn('Electron API not available');
      return { response: 0 };
    }

    try {
      return await electronAPI.showMessageBox(options);
    } catch (error) {
      console.error('Error showing message box:', error);
      return { response: 0 };
    }
  };

  const getAppVersion = (): string => {
    if (!isElectron || !electronAPI) {
      return '1.0.0';
    }

    try {
      return electronAPI.getAppVersion();
    } catch (error) {
      console.error('Error getting app version:', error);
      return '1.0.0';
    }
  };

  const openExternal = async (url: string): Promise<void> => {
    if (!isElectron || !electronAPI) {
      window.open(url, '_blank');
      return;
    }

    try {
      await electronAPI.openExternal(url);
    } catch (error) {
      console.error('Error opening external URL:', error);
      window.open(url, '_blank');
    }
  };

  const setWindowTitle = (title: string): void => {
    if (!isElectron || !electronAPI) {
      document.title = title;
      return;
    }

    try {
      electronAPI.setWindowTitle(title);
    } catch (error) {
      console.error('Error setting window title:', error);
      document.title = title;
    }
  };

  const onWindowEvent = (event: string, callback: (...args: any[]) => void) => {
    if (!isElectron || !electronAPI) {
      return () => {};
    }

    try {
      return electronAPI.on(event, callback);
    } catch (error) {
      console.error(`Error listening to window event "${event}":`, error);
      return () => {};
    }
  };

  const removeWindowEventListener = (event: string, callback: (...args: any[]) => void) => {
    if (!isElectron || !electronAPI) {
      return;
    }

    try {
      electronAPI.removeListener(event, callback);
    } catch (error) {
      console.error(`Error removing window event listener "${event}":`, error);
    }
  };

  return {
    isElectron,
    showMessageBox,
    getAppVersion,
    openExternal,
    setWindowTitle,
    onWindowEvent,
    removeWindowEventListener,
  };
}