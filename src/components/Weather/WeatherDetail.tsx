import React from 'react'
import { Card } from '@/components/Card'
import { Icon } from '@/components/Icon'
import type { IconName } from '@/components/Icon'
import type { CurrentWeather } from '@/types/weather'
import { cn } from '@/utils/cn'

export interface WeatherDetailProps {
  weather: CurrentWeather
  className?: string
}

interface DetailItem {
  icon: IconName
  label: string
  value: string
  unit: string
  color: string
}

export const WeatherDetail: React.FC<WeatherDetailProps> = ({ weather, className }) => {
  const details: DetailItem[] = [
    { icon: 'Thermometer', label: '体感温度', value: weather.feelsLike, unit: '°C', color: '#FF6B6B' },
    { icon: 'Droplets', label: '相对湿度', value: weather.humidity, unit: '%', color: '#4ECDC4' },
    { icon: 'Wind', label: '风速', value: weather.windSpeed, unit: 'km/h', color: '#95E1D3' },
    { icon: 'Navigation', label: '风向', value: weather.windDir, unit: '', color: '#FFD93D' },
    { icon: 'Gauge', label: '气压', value: weather.pressure, unit: 'hPa', color: '#6C5CE7' },
    { icon: 'Eye', label: '能见度', value: weather.vis, unit: 'km', color: '#74B9FF' },
    { icon: 'CloudRain', label: '降水量', value: weather.precip, unit: 'mm', color: '#0984E3' },
    { icon: 'Cloud', label: '云量', value: weather.cloud, unit: '%', color: '#B2BEC3' },
  ]

  return (
    <div className={cn(className)}>
      <h3 className="text-lg font-bold text-blue-900 mb-3">
        <Icon name="Info" size={20} className="inline mr-2" />
        天气详情
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {details.map((detail) => (
          <Card key={detail.label} variant="glass" hoverable padding="md">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${detail.color}20` }}>
                <Icon name={detail.icon} size={20} color={detail.color} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-blue-600 mb-1">{detail.label}</div>
                <div className="text-lg font-bold text-blue-900">
                  {detail.value}
                  <span className="text-sm text-blue-600 ml-1">{detail.unit}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
