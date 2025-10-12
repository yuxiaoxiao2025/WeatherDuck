import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun } from "lucide-react";
import { WeatherDisplay } from "./components/WeatherDisplay";
import { CitySearch } from "./components/CitySearch";
import { FavoriteCities } from "./components/FavoriteCities";
import { Settings } from "./components/Settings";
import { CuckooClock } from "./components/CuckooClock";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WeatherProvider } from "./contexts/WeatherContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { Sidebar } from "./components/Sidebar";
import "./App.css";

// 主应用组件
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    "weather" | "search" | "favorites" | "settings"
  >("weather");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟初始化加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // 加载动画组件
  const LoadingScreen = () => (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <motion.div
          className="mb-8"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Sun className="w-16 h-16 text-yellow-300 mx-auto" />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-white mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          天气鸭
        </motion.h1>

        <motion.p
          className="text-blue-100"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          正在加载天气数据...
        </motion.p>

        <motion.div
          className="mt-6 flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );

  // 主应用内容
  const MainContent = () => (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* 主内容区域 */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {currentView === "weather" && <WeatherDisplay />}
            {currentView === "search" && <CitySearch />}
            {currentView === "favorites" && <FavoriteCities />}
            {currentView === "settings" && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 布谷鸟时钟组件 */}
      <CuckooClock />
    </div>
  );

  return (
    <ThemeProvider>
      <SettingsProvider>
        <WeatherProvider>
          <div className="app">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <LoadingScreen key="loading" />
              ) : (
                <MainContent key="main" />
              )}
            </AnimatePresence>
          </div>
        </WeatherProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
