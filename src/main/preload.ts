import { contextBridge, ipcRenderer } from "electron";

// 定义API接口类型
export interface ElectronAPI {
  // 天气相关API
  getWeather: (cityName: string) => Promise<any>;
  getForecast: (cityName: string) => Promise<any>;
  searchCities: (query: string) => Promise<any>;

  // 数据库相关API
  saveFavoriteCity: (cityData: any) => Promise<any>;
  getFavoriteCities: () => Promise<any>;

  // 设置相关API
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<any>;

  // 系统相关API
  onShowAbout: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
}

// 暴露受保护的方法给渲染进程
const electronAPI: ElectronAPI = {
  // 天气相关API
  getWeather: (cityName: string) => ipcRenderer.invoke("get-weather", cityName),
  getForecast: (cityName: string) =>
    ipcRenderer.invoke("get-forecast", cityName),
  searchCities: (query: string) => ipcRenderer.invoke("search-cities", query),

  // 数据库相关API
  saveFavoriteCity: (cityData: any) =>
    ipcRenderer.invoke("save-favorite-city", cityData),
  getFavoriteCities: () => ipcRenderer.invoke("get-favorite-cities"),

  // 设置相关API
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings: any) =>
    ipcRenderer.invoke("save-settings", settings),

  // 系统相关API
  onShowAbout: (callback: () => void) => {
    ipcRenderer.on("show-about", callback);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

// 将API暴露给渲染进程
contextBridge.exposeInMainWorld("electronAPI", electronAPI);

// 类型声明，供TypeScript使用
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
