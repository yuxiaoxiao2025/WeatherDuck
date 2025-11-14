import React, { useRef } from 'react'
import { Card } from '@/components/Card'
import { Icon } from '@/components/Icon'
import { getWeatherIcon, getWeatherColor } from '@/constants/weather-icons'
import type { HourlyWeather } from '@/types/weather'
import { cn } from '@/utils/cn'

export interface HourlyForecastProps {
  hourlyData: HourlyWeather[]
  className?: string
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourlyData, className }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const formatHour = (timeStr: string): string => {
    const date = new Date(timeStr)
    const now = new Date()
    if (date.getHours() === now.getHours() && date.getDate() === now.getDate()) return '现在'
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  return (
    <div className={cn(className)}>
      <h3 className="text-lg font-bold text-blue-900 mb-3">
        <Icon name="Clock" size={20} className="inline mr-2" />
        24小时预报
      </h3>
      <div ref={scrollRef} className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
        {hourlyData.map((hour) => {
          const icon = getWeatherIcon(hour.icon)
          const color = getWeatherColor(hour.icon)
          return (
            <Card key={hour.fxTime} variant="glass" padding="sm" hoverable className="flex-shrink-0 w-20 text-center">
              <div className="text-xs text-blue-600 mb-2 font-medium">{formatHour(hour.fxTime)}</div>
              <Icon name={icon} size={28} color={color} className="mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-900 mb-1">{Math.round(Number(hour.temp))}°</div>
              {Number(hour.pop) > 30 && (
                <div className="text-xs text-blue-500">
                  <Icon name="Droplets" size={12} className="inline" />
                  <span className="ml-1">{hour.pop}%</span>
                </div>
              )}
              <div className="text-xs text-blue-500 mt-1">
                {hour.windDir}
                <br />
                {hour.windScale}级
              </div>
            </Card>
          )
        })}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
