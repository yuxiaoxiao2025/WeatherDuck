import React from 'react'
import { Card } from '@/components/Card'
import { Icon } from '@/components/Icon'
import { getWeatherIcon, getWeatherColor } from '@/constants/weather-icons'
import type { WeatherForecast } from '@/types/weather'
import { cn } from '@/utils/cn'

export interface ForecastListProps {
  forecasts: WeatherForecast[]
  className?: string
}

export const ForecastList: React.FC<ForecastListProps> = ({ forecasts, className }) => {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (date.toDateString() === today.toDateString()) return '今天'
    if (date.toDateString() === tomorrow.toDateString()) return '明天'
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-lg font-bold text-blue-900 mb-3">
        <Icon name="Calendar" size={20} className="inline mr-2" />
        7天预报
      </h3>
      {forecasts.map((forecast) => {
        const dayIcon = getWeatherIcon(forecast.iconDay)
        const dayColor = getWeatherColor(forecast.iconDay)
        return (
          <Card key={forecast.fxDate} variant="glass" hoverable className="transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-bold text-blue-900">{formatDate(forecast.fxDate)}</div>
                <div className="text-xs text-blue-600">
                  {new Date(forecast.fxDate).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                </div>
              </div>
              <div className="flex-1 text-center">
                <Icon name={dayIcon} size={32} color={dayColor} className="mx-auto" />
                <div className="text-sm text-blue-900 mt-1">{forecast.textDay}</div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-lg font-bold text-blue-900">{Math.round(Number(forecast.tempMax))}°</div>
                <div className="text-sm text-blue-600">{Math.round(Number(forecast.tempMin))}°</div>
              </div>
              {Number(forecast.precip) > 0 && (
                <div className="ml-3 text-blue-500">
                  <Icon name="Droplets" size={16} className="inline" />
                  <span className="text-xs ml-1">{forecast.precip}mm</span>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
