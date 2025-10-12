import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Cloud, CloudRain } from "lucide-react";

// 主应用组件
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<"weather" | "settings">("weather");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <motion.header
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Sun className="w-12 h-12 text-yellow-300 mr-3" />
            <h1 className="text-4xl font-bold text-white">天气鸭</h1>
          </div>
          <p className="text-blue-100">您的智能天气助手</p>
        </motion.header>

        {/* 导航 */}
        <motion.nav
          className="flex justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => setCurrentView("weather")}
              className={`px-6 py-2 rounded-md transition-all ${
                currentView === "weather"
                  ? "bg-white text-blue-600 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              天气
            </button>
            <button
              onClick={() => setCurrentView("settings")}
              className={`px-6 py-2 rounded-md transition-all ${
                currentView === "settings"
                  ? "bg-white text-blue-600 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              设置
            </button>
          </div>
        </motion.nav>

        {/* 主内容 */}
        <motion.main
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {currentView === "weather" && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 text-white">
              <div className="text-center">
                <Cloud className="w-24 h-24 mx-auto mb-4 text-white/80" />
                <h2 className="text-3xl font-bold mb-2">北京</h2>
                <p className="text-xl mb-4">多云</p>
                <div className="text-6xl font-light mb-4">22°C</div>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center">
                    <CloudRain className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm opacity-80">降水概率</p>
                    <p className="font-semibold">30%</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                      💨
                    </div>
                    <p className="text-sm opacity-80">风速</p>
                    <p className="font-semibold">12 km/h</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                      💧
                    </div>
                    <p className="text-sm opacity-80">湿度</p>
                    <p className="font-semibold">65%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === "settings" && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">设置</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>温度单位</span>
                  <select className="bg-white/20 border border-white/30 rounded px-3 py-1 text-white">
                    <option value="celsius">摄氏度 (°C)</option>
                    <option value="fahrenheit">华氏度 (°F)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span>自动刷新</span>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>通知</span>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>
              </div>
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );

};

export default App;
