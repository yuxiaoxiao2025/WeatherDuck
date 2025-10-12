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
} from "lucide-react";

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

const WeatherCard = () => (
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
          {mockWeatherData.location}
        </span>
      </div>
      <div className="flex items-center justify-center mb-4">
        <WeatherIcon condition={mockWeatherData.condition} size={80} />
      </div>
      <div className="text-5xl font-bold text-gray-800 mb-2">
        {mockWeatherData.temperature}°
      </div>
      <div className="text-xl text-gray-600">{mockWeatherData.condition}</div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="flex items-center space-x-2">
        <Droplets size={20} className="text-blue-500" />
        <div>
          <div className="text-sm text-gray-500">湿度</div>
          <div className="font-semibold">{mockWeatherData.humidity}%</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Wind size={20} className="text-green-500" />
        <div>
          <div className="text-sm text-gray-500">风速</div>
          <div className="font-semibold">{mockWeatherData.windSpeed} km/h</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Eye size={20} className="text-purple-500" />
        <div>
          <div className="text-sm text-gray-500">能见度</div>
          <div className="font-semibold">{mockWeatherData.visibility} km</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Gauge size={20} className="text-red-500" />
        <div>
          <div className="text-sm text-gray-500">气压</div>
          <div className="font-semibold">{mockWeatherData.pressure} hPa</div>
        </div>
      </div>
    </div>
  </motion.div>
);

const ForecastCard = () => (
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.4 }}
    className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto mt-6"
  >
    <h3 className="text-xl font-semibold text-gray-800 mb-4">5天预报</h3>
    <div className="grid grid-cols-5 gap-4">
      {mockWeatherData.forecast.map((day, index) => (
        <motion.div
          key={day.day}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm font-medium text-gray-600 mb-2">
            {day.day}
          </div>
          <div className="flex justify-center mb-2">
            <WeatherIcon condition={day.condition} size={32} />
          </div>
          <div className="text-sm text-gray-500 mb-1">{day.condition}</div>
          <div className="text-sm">
            <span className="font-semibold">{day.high}°</span>
            <span className="text-gray-400 ml-1">{day.low}°</span>
          </div>
        </motion.div>
      ))}
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

  useEffect(() => {
    // 模拟加载过程
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

              <WeatherCard />
              <ForecastCard />
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
                <div className="flex justify-center space-x-4">
                  <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                    <Download size={20} />
                    <span>下载 Windows 版</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors">
                    <Download size={20} />
                    <span>下载 macOS 版</span>
                  </button>
                  <button className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg transition-colors">
                    <ExternalLink size={20} />
                    <span>查看源码</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
