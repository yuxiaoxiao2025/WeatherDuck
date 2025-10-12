import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { VitePlugin } from '@electron-forge/plugin-vite';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: '天气鸭',
    executableName: 'weather-duck',
    icon: './assets/icon',
    appBundleId: 'com.weatherduck.app',
    appCategoryType: 'public.app-category.weather',
    win32metadata: {
      CompanyName: 'WeatherDuck Team',
      ProductName: '天气鸭',
      FileDescription: '一个优雅的天气应用',
    },
    osxSign: {},
    osxNotarize: {
      tool: 'notarytool',
      appleId: process.env.APPLE_ID || '',
      appleIdPassword: process.env.APPLE_PASSWORD || '',
      teamId: process.env.APPLE_TEAM_ID || '',
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'weather-duck',
      setupExe: 'WeatherDuck-Setup.exe',
      setupIcon: './assets/icon.ico',
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({
      options: {
        name: 'weather-duck',
        productName: '天气鸭',
        genericName: 'Weather App',
        description: '一个优雅的天气应用',
        categories: ['Utility', 'Weather'],
        icon: './assets/icon.png',
      },
    }),
    new MakerDeb({
      options: {
        name: 'weather-duck',
        productName: '天气鸭',
        genericName: 'Weather App',
        description: '一个优雅的天气应用',
        categories: ['Utility'],
        icon: './assets/icon.png',
      },
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/main/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;