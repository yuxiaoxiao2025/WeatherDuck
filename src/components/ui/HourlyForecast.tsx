import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge,
  Sun,
  Moon
} from 'lucide-react';
import { HourlyForecast as HourlyForecastType } from '../../types';
import { cn } from '../../utils/cn';
import { formatTime, formatTemperature } from '../../utils';

export interface HourlyForecastProps {
  data: HourlyForecastType[];
  temperatureUnit?: 'celsius' | 'fahrenheit';
  className?: string;
  showDetails?: boolean;
}

const HourlyForecastItem: React.FC<{
  forecast: HourlyForecastType;
  temperatureUnit: 'celsius' | 'fahrenheit';
  showDetails: boolean;
}> = ({ forecast, temperatureUnit, showDetails }) => {
  const isNow = new Date(forecast.time).getTime() <= Date.now() && 
                Date.now() < new Date(forecast.time).getTime() + 3600000; // 1小时内

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex-shrink-0 p-4 rounded-lg border transition-all duration-200",
        "hover:shadow-md hover:scale-105",
        isNow 
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        showDetails ? "w-48" : "w-24"
      )}
    >
      {/* 时间 */}
      <div className="text-center mb-3">
        <div className={cn(
          "text-sm font-medium",
          isNow ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
        )}>
          {isNow ? '现在' : formatTime(forecast.time)}
        </div>
        {showDetails && (
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {new Date(forecast.time).toLocaleDateString('zh-CN', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        )}
      </div>

      {/* 天气图标和状况 */}
      <div className="text-center mb-3">
        <div className="flex justify-center mb-2">
          {forecast.isDay ? (
            <Sun size={showDetails ? 32 : 24} className="text-yellow-500" />
          ) : (
            <Moon size={showDetails ? 32 : 24} className="text-blue-400" />
          )}
        </div>
        {showDetails && (
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {forecast.condition.text}
          </div>
        )}
      </div>

      {/* 温度 */}
      <div className="text-center mb-3">
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {formatTemperature(forecast.temperature, temperatureUnit)}
        </div>
        {showDetails && (
          <div className="text-xs text-gray-500 dark:text-gray-500">
            体感 {formatTemperature(forecast.feelsLike, temperatureUnit)}
          </div>
        )}
      </div>

      {/* 降水概率 */}
      <div className="flex items-center justify-center mb-2">
        <Droplets size={12} className="text-blue-500 mr-1" />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {forecast.chanceOfRain}%
        </span>
      </div>

      {/* 详细信息 */}
      {showDetails && (
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {/* 风速 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500 dark:text-gray-500">
              <Wind size={12} className="mr-1" />
              <span>风速</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              {forecast.windSpeed} km/h
            </span>
          </div>

          {/* 湿度 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500 dark:text-gray-500">
              <Droplets size={12} className="mr-1" />
              <span>湿度</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              {forecast.humidity}%
            </span>
          </div>

          {/* 云量 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500 dark:text-gray-500">
              <Eye size={12} className="mr-1" />
              <span>云量</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              {forecast.cloudCover}%
            </span>
          </div>

          {/* 气压 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500 dark:text-gray-500">
              <Gauge size={12} className="mr-1" />
              <span>气压</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              {forecast.pressure} hPa
            </span>
          </div>

          {/* 降雨概率 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500 dark:text-gray-500">
              <Sun size={12} className="mr-1" />
              <span>降雨概率</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              {forecast.chanceOfRain}%
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  data,
  temperatureUnit = 'celsius',
  className,
  showDetails = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700",
        className
      )}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          暂无小时预报数据
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
      className
    )}>
      {/* 标题 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          24小时预报
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {data.length} 小时
        </div>
      </div>

      {/* 预报内容 */}
      <div className="relative">
        {/* 左滚动按钮 */}
        <button
          onClick={scrollLeft}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-10",
            "p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg",
            "border border-gray-200 dark:border-gray-600",
            "hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          )}
        >
          <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
        </button>

        {/* 右滚动按钮 */}
        <button
          onClick={scrollRight}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-10",
            "p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg",
            "border border-gray-200 dark:border-gray-600",
            "hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          )}
        >
          <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
        </button>

        {/* 滚动容器 */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 p-4 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {data.map((forecast, index) => (
            <HourlyForecastItem
              key={`${forecast.time}-${index}`}
              forecast={forecast}
              temperatureUnit={temperatureUnit}
              showDetails={showDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;