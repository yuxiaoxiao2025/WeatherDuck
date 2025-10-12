import { contextBridge, ipcRenderer } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(c => c === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(c => c === child)) {
      return parent.removeChild(child);
    }
  },
};

// --------- Expose API to renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showMessageBox: (options: Electron.MessageBoxOptions) => 
    ipcRenderer.invoke('show-message-box', options),
  showErrorBox: (title: string, content: string) => 
    ipcRenderer.invoke('show-error-box', title, content),
  openWindow: (url: string) => ipcRenderer.invoke('open-win', url),
  
  // Platform info
  platform: process.platform,
  
  // Safe DOM manipulation
  safeDOM,
  
  // Environment info
  isElectron: true,
});

// --------- Loading animation ---------
domReady().then(() => {
  const loaderElement = document.querySelector('#initial-loader');
  if (loaderElement) {
    loaderElement.remove();
  }
});

// --------- Type definitions for renderer process ---------
export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
  showErrorBox: (title: string, content: string) => Promise<void>;
  openWindow: (url: string) => Promise<void>;
  platform: NodeJS.Platform;
  safeDOM: typeof safeDOM;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    ipcRenderer: typeof ipcRenderer;
  }
}