import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Thermometer, Droplets, Wind, Eye, Gauge, Sun, Moon } from 'lucide-react';
import { ForecastData } from '../../types';
import { formatTemperature, formatDate } from '../../utils';
import { cn } from '../../utils/cn';

export interface ForecastCardProps {
  forecast: ForecastData[];
  className?: string;
  showDetails?: boolean;
  maxDays?: number;
}

const WeatherIcon: React.FC<{ condition: string; size?: number; className?: string }> = ({ 
  condition, 
  size = 24, 
  className 
}) => {
  const iconMap: Record<string, React.ReactNode> = {
    '晴': <Sun size={size} className={cn("text-yellow-500", className)} />,
    '多云': <Sun size={size} className={cn("text-yellow-400", className)} />,
    '阴': <Sun size={size} className={cn("text-gray-500", className)} />,
    '小雨': <Droplets size={size} className={cn("text-blue-500", className)} />,
    '中雨': <Droplets size={size} className={cn("text-blue-600", className)} />,
    '大雨': <Droplets size={size} className={cn("text-blue-700", className)} />,
    '雪': <Sun size={size} className={cn("text-blue-200", className)} />,
  };

  return iconMap[condition] || <Sun size={size} className={cn("text-gray-400", className)} />;
};

const ForecastDayCard: React.FC<{
  day: ForecastData;
  index: number;
  showDetails: boolean;
}> = ({ day, index, showDetails }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200",
        "border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
      )}
    >
      {/* 日期 */}
      <div className="flex items-center justify-center mb-3">
        <Calendar size={16} className="text-gray-500 mr-2" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formatDate(day.date, 'short')}
        </span>
      </div>

      {/* 天气图标和状况 */}
      <div className="flex flex-col items-center mb-3">
        <WeatherIcon condition={day.day.condition.text} size={32} className="mb-2" />
        <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
          {day.day.condition.text}
        </span>
      </div>

      {/* 温度 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Thermometer size={14} className="text-red-500 mr-1" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {formatTemperature(day.day.maxTemp, 'celsius')}
          </span>
        </div>
        <div className="flex items-center">
          <Thermometer size={14} className="text-blue-500 mr-1" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatTemperature(day.day.minTemp, 'celsius')}
          </span>
        </div>
      </div>

      {/* 详细信息 */}
      {showDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <Droplets size={12} className="text-blue-500 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">{day.day.humidity}%</span>
            </div>
            <div className="flex items-center">
              <Wind size={12} className="text-green-500 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">{day.day.maxWindSpeed}km/h</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <Eye size={12} className="text-purple-500 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">可见度</span>
            </div>
            <div className="flex items-center">
              <Gauge size={12} className="text-orange-500 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">气压</span>
            </div>
          </div>

          {day.astro && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <Sun size={12} className="text-yellow-500 mr-1" />
                <span className="text-gray-600 dark:text-gray-400">{day.astro.sunrise}</span>
              </div>
              <div className="flex items-center">
                <Moon size={12} className="text-blue-400 mr-1" />
                <span className="text-gray-600 dark:text-gray-400">{day.astro.sunset}</span>
              </div>
            </div>
          )}

          {(day.day.chanceOfRain !== undefined && day.day.chanceOfRain > 0) && (
            <div className="flex items-center justify-center text-xs">
              <Droplets size={12} className="text-blue-500 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">
                降雨概率 {day.day.chanceOfRain}%
              </span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export const ForecastCard: React.FC<ForecastCardProps> = ({
  forecast,
  className,
  showDetails = false,
  maxDays = 7
}) => {
  const displayForecast = forecast.slice(0, maxDays);

  if (!forecast || forecast.length === 0) {
    return (
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6",
        "border border-gray-100 dark:border-gray-700",
        className
      )}>
        <div className="text-center py-8">
          <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">暂无预报数据</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6",
        "border border-gray-100 dark:border-gray-700",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <Calendar size={24} className="mr-2 text-blue-500" />
          {maxDays}天预报
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {displayForecast.length} 天数据
        </span>
      </div>

      <div className={cn(
        "grid gap-4",
        displayForecast.length <= 3 ? "grid-cols-1 sm:grid-cols-3" :
        displayForecast.length <= 5 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" :
        "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
      )}>
        {displayForecast.map((day, index) => (
          <ForecastDayCard
            key={day.date}
            day={day}
            index={index}
            showDetails={showDetails}
          />
        ))}
      </div>

      {forecast.length > maxDays && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            还有 {forecast.length - maxDays} 天预报数据
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ForecastCard;