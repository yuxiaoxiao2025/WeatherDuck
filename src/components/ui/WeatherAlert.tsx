import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Clock, MapPin, Info } from 'lucide-react';
import { WeatherAlert as WeatherAlertType } from '../../types';
import { formatTime } from '../../utils';
import { cn } from '../../utils/cn';

export interface WeatherAlertProps {
  alerts: WeatherAlertType[];
  className?: string;
  onDismiss?: (alertId: string) => void;
  maxAlerts?: number;
  showDetails?: boolean;
}

const AlertIcon: React.FC<{ severity: string; size?: number }> = ({ severity, size = 20 }) => {
  const getIconColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minor':
      case '蓝色':
        return 'text-blue-500';
      case 'moderate':
      case '黄色':
        return 'text-yellow-500';
      case 'severe':
      case '橙色':
        return 'text-orange-500';
      case 'extreme':
      case '红色':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return <AlertTriangle size={size} className={getIconColor(severity)} />;
};

const AlertCard: React.FC<{
  alert: WeatherAlertType;
  index: number;
  onDismiss?: (alertId: string) => void;
  showDetails: boolean;
}> = ({ alert, index, onDismiss, showDetails }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minor':
      case '蓝色':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'moderate':
      case '黄色':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'severe':
      case '橙色':
        return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800';
      case 'extreme':
      case '红色':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minor':
      case '蓝色':
        return 'text-blue-800 dark:text-blue-200';
      case 'moderate':
      case '黄色':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'severe':
      case '橙色':
        return 'text-orange-800 dark:text-orange-200';
      case 'extreme':
      case '红色':
        return 'text-red-800 dark:text-red-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "border rounded-lg p-4 relative",
        getSeverityColor(alert.severity)
      )}
    >
      {/* 关闭按钮 */}
      {onDismiss && (
        <button
          onClick={() => onDismiss(alert.id)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="关闭警报"
        >
          <X size={16} className="text-gray-500 dark:text-gray-400" />
        </button>
      )}

      {/* 警报标题 */}
      <div className="flex items-start space-x-3 mb-3">
        <AlertIcon severity={alert.severity} size={24} />
        <div className="flex-1">
          <h4 className={cn(
            "font-semibold text-lg leading-tight",
            getSeverityTextColor(alert.severity)
          )}>
            {alert.title}
          </h4>
          <div className="flex items-center space-x-4 mt-1 text-sm">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              getSeverityColor(alert.severity),
              getSeverityTextColor(alert.severity)
            )}>
              {alert.severity}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {alert.category}
            </span>
          </div>
        </div>
      </div>

      {/* 警报描述 */}
      <p className={cn(
        "text-sm mb-3 leading-relaxed",
        getSeverityTextColor(alert.severity)
      )}>
        {alert.description}
      </p>

      {/* 详细信息 */}
      {showDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-2 pt-3 border-t border-current/20"
        >
          {/* 时间信息 */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
                <Clock size={14} className="text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  发布: {formatTime(alert.effective)}
                </span>
              </div>
              {alert.expires && (
                <div className="flex items-center space-x-1">
                  <Clock size={14} className="text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    结束: {formatTime(alert.expires)}
                  </span>
                </div>
              )}
          </div>

          {/* 地区信息 */}
          {alert.areas && alert.areas.length > 0 && (
            <div className="flex items-start space-x-1 text-sm">
              <MapPin size={14} className="text-gray-500 mt-0.5" />
              <div>
                <span className="text-gray-600 dark:text-gray-400">影响地区: </span>
                <span className={getSeverityTextColor(alert.severity)}>
                  {alert.areas.join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* 事件类型 */}
            {alert.event && (
              <div className="flex items-center space-x-1 text-sm">
                <Info size={14} className="text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  事件: {alert.event}
                </span>
              </div>
            )}
        </motion.div>
      )}
    </motion.div>
  );
};

export const WeatherAlert: React.FC<WeatherAlertProps> = ({
  alerts,
  className,
  onDismiss,
  maxAlerts = 5,
  showDetails = true
}) => {
  const displayAlerts = alerts.slice(0, maxAlerts);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6",
        "border border-gray-100 dark:border-gray-700",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <AlertTriangle size={24} className="mr-2 text-orange-500" />
          天气预警
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {displayAlerts.length} 条警报
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {displayAlerts.map((alert, index) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              index={index}
              onDismiss={onDismiss}
              showDetails={showDetails}
            />
          ))}
        </div>
      </AnimatePresence>

      {alerts.length > maxAlerts && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            还有 {alerts.length - maxAlerts} 条警报
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default WeatherAlert;