import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  X, 
  Thermometer, 
  MapPin, 
  Bell, 
  Palette,
  Globe,
  Save,
  RotateCcw
} from 'lucide-react';
import { Theme } from '../../types';
import { cn } from '../../utils/cn';
import Button from './Button';

export interface SettingsConfig {
  theme: Theme;
  temperatureUnit: 'celsius' | 'fahrenheit';
  language: 'zh-CN' | 'en-US';
  defaultLocation: string;
  autoRefresh: boolean;
  refreshInterval: number; // 分钟
  notifications: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsConfig;
  onSettingsChange: (settings: SettingsConfig) => void;
  className?: string;
}

const SettingSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="mb-6">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 ml-2">
        {title}
      </h3>
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const SettingItem: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      )}
    </div>
    <div className="ml-4">
      {children}
    </div>
  </div>
);

const Toggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled = false }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
        checked ? "translate-x-6" : "translate-x-1"
      )}
    />
  </button>
);

const Select: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}> = ({ value, onChange, options, disabled = false }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={cn(
      "px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md",
      "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const Input: React.FC<{
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}> = ({ value, onChange, type = 'text', placeholder, disabled = false, min, max }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    min={min}
    max={max}
    className={cn(
      "px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md",
      "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  />
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  className
}) => {
  const [localSettings, setLocalSettings] = useState<SettingsConfig>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof SettingsConfig>(
    key: K,
    value: SettingsConfig[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(settings));
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const themeOptions = [
    { value: 'light', label: '浅色主题' },
    { value: 'dark', label: '深色主题' },
    { value: 'system', label: '跟随系统' }
  ];

  const temperatureOptions = [
    { value: 'celsius', label: '摄氏度 (°C)' },
    { value: 'fahrenheit', label: '华氏度 (°F)' }
  ];

  const languageOptions = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English' }
  ];

  const refreshIntervalOptions = [
    { value: '5', label: '5分钟' },
    { value: '10', label: '10分钟' },
    { value: '15', label: '15分钟' },
    { value: '30', label: '30分钟' },
    { value: '60', label: '1小时' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* 设置面板 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50",
              "border-l border-gray-200 dark:border-gray-700 overflow-y-auto",
              className
            )}
          >
            {/* 头部 */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Settings size={24} className="text-blue-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    设置
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* 设置内容 */}
            <div className="p-6 space-y-6">
              {/* 外观设置 */}
              <SettingSection
                title="外观"
                icon={<Palette size={20} className="text-purple-500" />}
              >
                <SettingItem label="主题" description="选择应用的外观主题">
                  <Select
                    value={localSettings.theme}
                    onChange={(value) => updateSetting('theme', value as Theme)}
                    options={themeOptions}
                  />
                </SettingItem>

                <SettingItem label="动画效果" description="启用界面动画和过渡效果">
                  <Toggle
                    checked={localSettings.animationsEnabled}
                    onChange={(checked) => updateSetting('animationsEnabled', checked)}
                  />
                </SettingItem>
              </SettingSection>

              {/* 单位设置 */}
              <SettingSection
                title="单位"
                icon={<Thermometer size={20} className="text-red-500" />}
              >
                <SettingItem label="温度单位" description="选择温度显示单位">
                  <Select
                    value={localSettings.temperatureUnit}
                    onChange={(value) => updateSetting('temperatureUnit', value as 'celsius' | 'fahrenheit')}
                    options={temperatureOptions}
                  />
                </SettingItem>
              </SettingSection>

              {/* 位置设置 */}
              <SettingSection
                title="位置"
                icon={<MapPin size={20} className="text-green-500" />}
              >
                <SettingItem label="默认位置" description="应用启动时显示的默认城市">
                  <Input
                    value={localSettings.defaultLocation}
                    onChange={(value) => updateSetting('defaultLocation', value)}
                    placeholder="输入城市名称"
                  />
                </SettingItem>
              </SettingSection>

              {/* 刷新设置 */}
              <SettingSection
                title="数据刷新"
                icon={<RotateCcw size={20} className="text-blue-500" />}
              >
                <SettingItem label="自动刷新" description="定期自动更新天气数据">
                  <Toggle
                    checked={localSettings.autoRefresh}
                    onChange={(checked) => updateSetting('autoRefresh', checked)}
                  />
                </SettingItem>

                <SettingItem label="刷新间隔" description="自动刷新的时间间隔">
                  <Select
                    value={localSettings.refreshInterval.toString()}
                    onChange={(value) => updateSetting('refreshInterval', parseInt(value))}
                    options={refreshIntervalOptions}
                    disabled={!localSettings.autoRefresh}
                  />
                </SettingItem>
              </SettingSection>

              {/* 通知设置 */}
              <SettingSection
                title="通知"
                icon={<Bell size={20} className="text-yellow-500" />}
              >
                <SettingItem label="推送通知" description="接收天气预警和更新通知">
                  <Toggle
                    checked={localSettings.notifications}
                    onChange={(checked) => updateSetting('notifications', checked)}
                  />
                </SettingItem>

                <SettingItem label="声音提醒" description="通知时播放提示音">
                  <Toggle
                    checked={localSettings.soundEnabled}
                    onChange={(checked) => updateSetting('soundEnabled', checked)}
                    disabled={!localSettings.notifications}
                  />
                </SettingItem>
              </SettingSection>

              {/* 语言设置 */}
              <SettingSection
                title="语言"
                icon={<Globe size={20} className="text-indigo-500" />}
              >
                <SettingItem label="界面语言" description="选择应用界面语言">
                  <Select
                    value={localSettings.language}
                    onChange={(value) => updateSetting('language', value as 'zh-CN' | 'en-US')}
                    options={languageOptions}
                  />
                </SettingItem>
              </SettingSection>
            </div>

            {/* 底部操作按钮 */}
            {hasChanges && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save size={16} className="mr-2" />
                    保存设置
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="secondary"
                    className="flex-1"
                  >
                    <RotateCcw size={16} className="mr-2" />
                    重置
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;