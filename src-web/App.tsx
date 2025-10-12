import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  MapPin,
  Thermometer,
  Droplets,
  Eye,
  Gauge,
  Download,
  Github,
  ExternalLink,
  Settings,
  Clock,
} from "lucide-react";

// 导入共享组件库
import { Button, LoadingSpinner, useTheme, usePlatform, useWeather, formatTemperature } from "../src";

// 直接导入新的UI组件 (暂时注释以测试基础功能)
// import { ForecastCard } from "../src/components/ui/ForecastCard";
// import { WeatherAlert } from "../src/components/ui/WeatherAlert";
import { SettingsPanel } from "../src/components/ui/SettingsPanel";
// import { LocationSearch } from "../src/components/ui/LocationSearch";
// import { HourlyForecast } from "../src/components/ui/HourlyForecast";

// Web版本的模拟数据
const mockWeatherData = {
  location: "北京市",
  temperature: 22,
  condition: "晴",
  humidity: 65,
  windSpeed: 12,
  visibility: 10,
  pressure: 1013,
  forecast: [
    { day: "今天", high: 25, low: 18, condition: "晴", icon: Sun },
    { day: "明天", high: 23, low: 16, condition: "多云", icon: Cloud },
    { day: "后天", high: 20, low: 14, condition: "小雨", icon: CloudRain },
    { day: "周四", high: 18, low: 12, condition: "雨", icon: CloudRain },
    { day: "周五", high: 22, low: 15, condition: "晴", icon: Sun },
  ],
};

const WeatherIcon = ({
  condition,
  size = 64,
}: {
  condition: string;
  size?: number;
}) => {
  const iconProps = { size, className: "text-blue-500" };

  switch (condition) {
    case "晴":
      return <Sun {...iconProps} className="text-yellow-500" />;
    case "多云":
      return <Cloud {...iconProps} className="text-gray-500" />;
    case "小雨":
    case "雨":
      return <CloudRain {...iconProps} className="text-blue-500" />;
    case "雪":
      return <Snowflake {...iconProps} className="text-blue-200" />;
    default:
      return <Sun {...iconProps} />;
  }
};

const WebPreviewBanner = () => (
  <motion.div
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 text-center"
  >
    <div className="max-w-4xl mx-auto flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-lg font-semibold">🚀 天气鸭 Web 预览版</span>
        <span className="text-sm opacity-90">体验核心功能</span>
      </div>
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors">
          <Download size={16} />
          <span className="text-sm">下载桌面版</span>
        </button>
        <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors">
          <Github size={16} />
          <span className="text-sm">GitHub</span>
        </button>
      </div>
    </div>
  </motion.div>
);

interface WeatherCardProps {
  location?: string;
  temperature?: string;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
  visibility?: number;
  pressure?: number;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  location = mockWeatherData.location,
  temperature = formatTemperature(mockWeatherData.temperature, 'celsius'),
  condition = mockWeatherData.condition,
  humidity = mockWeatherData.humidity,
  windSpeed = mockWeatherData.windSpeed,
  visibility = mockWeatherData.visibility,
  pressure = mockWeatherData.pressure,
}) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.2 }}
    className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto"
  >
    <div className="text-center mb-6">
      <div className="flex items-center justify-center mb-2">
        <MapPin size={20} className="text-gray-500 mr-2" />
        <span className="text-lg font-medium text-gray-700">
          {location}
        </span>
      </div>
      <div className="flex items-center justify-center mb-4">
        <WeatherIcon condition={condition} size={80} />
      </div>
      <div className="text-5xl font-bold text-gray-800 mb-2">
        {temperature}
      </div>
      <div className="text-xl text-gray-600">{condition}</div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="flex items-center space-x-2">
        <Droplets size={20} className="text-blue-500" />
        <div>
          <div className="text-sm text-gray-500">湿度</div>
          <div className="font-semibold">{humidity}%</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Wind size={20} className="text-green-500" />
        <div>
          <div className="text-sm text-gray-500">风速</div>
          <div className="font-semibold">{windSpeed} km/h</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Eye size={20} className="text-purple-500" />
        <div>
          <div className="text-sm text-gray-500">能见度</div>
          <div className="font-semibold">{visibility} km</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Gauge size={20} className="text-red-500" />
        <div>
          <div className="text-sm text-gray-500">气压</div>
          <div className="font-semibold">{pressure} hPa</div>
        </div>
      </div>
    </div>
  </motion.div>
);

const FeatureShowcase = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6 }}
    className="max-w-4xl mx-auto mt-8 p-6"
  >
    <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
      桌面版完整功能
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-center p-6 bg-white rounded-xl shadow-lg">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Thermometer className="text-blue-600" size={32} />
        </div>
        <h4 className="font-semibold text-gray-800 mb-2">实时天气</h4>
        <p className="text-gray-600 text-sm">
          精准的实时天气数据，包括温度、湿度、风速等详细信息
        </p>
      </div>

      <div className="text-center p-6 bg-white rounded-xl shadow-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="text-green-600" size={32} />
        </div>
        <h4 className="font-semibold text-gray-800 mb-2">多地管理</h4>
        <p className="text-gray-600 text-sm">
          支持添加多个城市，快速切换查看不同地区天气
        </p>
      </div>

      <div className="text-center p-6 bg-white rounded-xl shadow-lg">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Cloud className="text-purple-600" size={32} />
        </div>
        <h4 className="font-semibold text-gray-800 mb-2">天气预警</h4>
        <p className="text-gray-600 text-sm">
          及时的天气预警通知，让您提前做好准备
        </p>
      </div>
    </div>
  </motion.div>
);

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { platform } = usePlatform();
  const { 
    weatherData, 
    loading: weatherLoading, 
    error: weatherError,
    getCompleteWeatherData,
    getHourlyForecast,
    clearError 
  } = useWeather();

  useEffect(() => {
    // 模拟加载过程
    const timer = setTimeout(() => {
      setIsLoaded(true);
      // 加载完成后获取北京的天气数据作为演示
      getCompleteWeatherData('北京');
      getHourlyForecast('北京');
    }, 1000);

    return () => clearTimeout(timer);
  }, [getCompleteWeatherData, getHourlyForecast]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">正在加载天气鸭...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AnimatePresence>
        {isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WebPreviewBanner />

            <div className="container mx-auto px-4 py-8">
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  天气鸭
                </h1>
                <p className="text-gray-600">现代化的桌面天气应用</p>
              </motion.div>

              {weatherLoading && (
                 <div className="flex items-center justify-center p-8">
                   <LoadingSpinner size="large" />
                   <span className="ml-3 text-gray-600">正在获取天气数据...</span>
                 </div>
               )}

               {weatherError && (
                 <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6">
                   <p className="text-red-700 dark:text-red-300">天气数据加载失败: {weatherError}</p>
                   <Button 
                     onClick={() => {
                       clearError();
                       getCompleteWeatherData('北京');
                     }}
                     className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                   >
                     重试
                   </Button>
                 </div>
               )}
              
              <WeatherCard
                 location={weatherData?.location.name}
                 temperature={weatherData ? formatTemperature(weatherData.current.temperature, 'celsius') : undefined}
                 condition={weatherData?.current.condition.text}
                 humidity={weatherData?.current.humidity}
                 windSpeed={weatherData?.current.windSpeed}
                 visibility={weatherData?.current.visibility}
                 pressure={weatherData?.current.pressure}
               />

               {/* 新UI组件展示区域 */}
               <div className="mt-8 space-y-6">
                 {/* 组件展示控制按钮 */}
                 <div className="flex justify-center space-x-4 mb-6">
                   <Button 
                     onClick={() => setShowComponents(!showComponents)}
                     variant="primary"
                     icon={<Clock />}
                   >
                     {showComponents ? '隐藏组件展示' : '展示UI组件'}
                   </Button>
                   <Button 
                     onClick={() => setShowSettings(true)}
                     variant="secondary"
                     icon={<Settings />}
                   >
                     打开设置面板
                   </Button>
                 </div>

                 {/* 小时预报组件 (暂时注释) */}
                 {/* {hourlyForecast && hourlyForecast.length > 0 && (
                   <HourlyForecast 
                     data={hourlyForecast}
                     temperatureUnit="celsius"
                     showDetails={true}
                   />
                 )} */}

                 {/* 天气预报卡片 (暂时注释) */}
                 {/* {forecast && forecast.length > 0 && (
                   <ForecastCard 
                     data={forecast}
                     temperatureUnit="celsius"
                   />
                 )} */}

                 {/* 组件展示区域 (暂时注释) */}
                 {/* {showComponents && (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="space-y-6"
                   >
                     <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                       <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">位置搜索组件</h3>
                       <LocationSearch
                         onLocationSelect={(location) => {
                           console.log('选择位置:', location);
                           getCompleteWeatherData(location.name);
                         }}
                         onSearch={searchLocations}
                         placeholder="搜索城市..."
                         showCurrentLocation={true}
                         onCurrentLocationClick={() => console.log('使用当前位置')}
                       />
                     </div>

                     <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                       <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">天气预警组件</h3>
                       <WeatherAlert
                         alerts={[
                           {
                             id: '1',
                             title: '高温预警',
                             description: '预计今日最高温度将达到35°C，请注意防暑降温。',
                             severity: 'severe',
                             urgency: 'expected',
                             areas: ['北京市', '朝阳区'],
                             category: 'heat',
                             certainty: 'likely',
                             event: '高温预警',
                             effective: new Date().toISOString(),
                             expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                             desc: '预计今日最高温度将达到35°C，请注意防暑降温。'
                           }
                         ]}
                         onDismiss={(id) => console.log('关闭预警:', id)}
                       />
                     </div>
                   </motion.div>
                 )} */}
               </div>

              <FeatureShowcase />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center mt-12 pb-8"
              >
                <p className="text-gray-500 text-sm mb-4">
                  这是Web预览版，完整功能请下载桌面应用
                </p>
                <div className="flex justify-center space-x-4 mb-6">
                  <Button 
                    variant="primary" 
                    size="large"
                    icon={<Download size={20} />}
                    onClick={() => window.open('#', '_blank')}
                  >
                    下载 Windows 版
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="large"
                    icon={<Download size={20} />}
                    onClick={() => window.open('#', '_blank')}
                  >
                    下载 macOS 版
                  </Button>
                  <Button 
                    variant="info" 
                    size="large"
                    icon={<ExternalLink size={20} />}
                    onClick={() => window.open('https://github.com', '_blank')}
                  >
                    查看源码
                  </Button>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="success" 
                    size="medium"
                    onClick={toggleTheme}
                  >
                    切换主题 ({theme})
                  </Button>
                  <Button 
                    variant="warning" 
                    size="medium"
                    disabled
                  >
                    平台: {platform}
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={{
          theme: theme,
          temperatureUnit: 'celsius',
          language: 'zh-CN',
          defaultLocation: '北京',
          autoRefresh: true,
          refreshInterval: 15,
          notifications: true,
          soundEnabled: false,
          animationsEnabled: true
        }}
        onSettingsChange={(newSettings: any) => {
          console.log('设置已更新:', newSettings);
          // 这里可以保存设置到本地存储或发送到服务器
        }}
      />
    </div>
  );
};

export default App;
