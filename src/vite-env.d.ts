/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
  readonly VITE_WEATHER_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    accept(): void;
    accept(cb: (mod: any) => void): void;
    accept(dep: string, cb: (mod: any) => void): void;
    accept(deps: string[], cb: (mods: any[]) => void): void;
    dispose(cb: () => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: any[]) => void): void;
  };
}

declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;
