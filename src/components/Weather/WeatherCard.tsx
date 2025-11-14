import React from 'react'
import { Card } from '@/components/Card'
import { Icon } from '@/components/Icon'
import { getWeatherIcon, getWeatherColor } from '@/constants/weather-icons'
import type { CurrentWeather } from '@/types/weather'
import { cn } from '@/utils/cn'

export interface WeatherCardProps {
  weather: CurrentWeather
  cityName?: string
  className?: string
  onClick?: () => void
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  cityName,
  className,
  onClick,
}) => {
  const iconName = getWeatherIcon(weather.icon)
  const weatherColor = getWeatherColor(weather.icon)

  return (
    <Card variant="glass" className={cn('relative overflow-hidden', className)} onClick={onClick}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ background: weatherColor }} />
      {cityName && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-blue-900">
            <Icon name="MapPin" size={18} className="inline mr-1" />
            {cityName}
          </h3>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-6xl font-bold text-blue-900">{Math.round(Number(weather.temp))}°</div>
          <div className="text-sm text-blue-600 mt-1">体感 {Math.round(Number(weather.feelsLike))}°</div>
        </div>
        <div className="text-center">
          <Icon name={iconName} size={64} color={weatherColor} className="mb-2" />
          <div className="text-lg font-medium text-blue-900">{weather.text}</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-blue-200">
        <div className="text-center">
          <Icon name="Droplets" size={16} color="#64B5F6" className="mx-auto mb-1" />
          <div className="text-xs text-blue-600">湿度</div>
          <div className="text-sm font-bold text-blue-900">{weather.humidity}%</div>
        </div>
        <div className="text-center">
          <Icon name="Wind" size={16} color="#64B5F6" className="mx-auto mb-1" />
          <div className="text-xs text-blue-600">风速</div>
          <div className="text-sm font-bold text-blue-900">{weather.windSpeed}km/h</div>
        </div>
        <div className="text-center">
          <Icon name="Gauge" size={16} color="#64B5F6" className="mx-auto mb-1" />
          <div className="text-xs text-blue-600">气压</div>
          <div className="text-sm font-bold text-blue-900">{weather.pressure}hPa</div>
        </div>
        <div className="text-center">
          <Icon name="Eye" size={16} color="#64B5F6" className="mx-auto mb-1" />
          <div className="text-xs text-blue-600">能见度</div>
          <div className="text-sm font-bold text-blue-900">{weather.vis}km</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-blue-500 text-center">
        更新于 {new Date(weather.obsTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </Card>
  )
}
