import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React, { useEffect, useState } from 'react'
import { WeatherCard } from '@/components/Weather/WeatherCard'
import { ForecastList } from '@/components/Weather/ForecastList'
import { HourlyForecast } from '@/components/Weather/HourlyForecast'
import type { CurrentWeather, WeatherForecast, HourlyWeather } from '@/types/weather'
import { WeatherService } from '@/services/weather-service'

const current: CurrentWeather = {
  obsTime: new Date().toISOString(),
  temp: '25',
  feelsLike: '24',
  icon: '100',
  text: '晴',
  wind360: '90',
  windDir: '东风',
  windScale: '3',
  windSpeed: '15',
  humidity: '50',
  precip: '0.0',
  pressure: '1012',
  vis: '10',
  cloud: '20',
  dew: '12',
}

const daily: WeatherForecast[] = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return {
    fxDate: d.toISOString(),
    sunrise: '',
    sunset: '',
    moonrise: '',
    moonset: '',
    moonPhase: '',
    tempMax: String(26 - i),
    tempMin: String(18 - i),
    iconDay: i % 2 === 0 ? '100' : '305',
    textDay: i % 2 === 0 ? '晴' : '小雨',
    iconNight: '104',
    textNight: '阴',
    wind360Day: '90',
    windDirDay: '东风',
    windScaleDay: '3',
    windSpeedDay: '15',
    wind360Night: '180',
    windDirNight: '南风',
    windScaleNight: '2',
    windSpeedNight: '10',
    humidity: '60',
    precip: '0.1',
    pressure: '1010',
    vis: '10',
    cloud: '30',
    uvIndex: '4',
  }
})

const hourly: HourlyWeather[] = Array.from({ length: 24 }).map((_, i) => {
  const d = new Date()
  d.setHours(d.getHours() + i)
  return {
    fxTime: d.toISOString(),
    temp: String(20 + i % 5),
    icon: i % 3 === 0 ? '305' : '100',
    text: i % 3 === 0 ? '小雨' : '晴',
    wind360: '90',
    windDir: '东风',
    windScale: String(2 + (i % 3)),
    windSpeed: String(10 + i),
    humidity: '55',
    pop: String(i % 2 === 0 ? 40 : 20),
    precip: '0.0',
    pressure: '1012',
    cloud: '20',
    dew: '12',
  }
})


const WeatherContainer: React.FC<{ service: Pick<WeatherService, 'getCurrentWeather' | 'getWeatherForecast' | 'getHourlyForecast'> }> = ({ service }) => {
  const [cw, setCw] = useState<CurrentWeather | null>(null)
  const [df, setDf] = useState<WeatherForecast[] | null>(null)
  const [hf, setHf] = useState<HourlyWeather[] | null>(null)
  useEffect(() => {
    const run = async () => {
      const [a, b, c] = await Promise.all([
        service.getCurrentWeather('101020300'),
        service.getWeatherForecast('101020300'),
        service.getHourlyForecast('101020300'),
      ])
      setCw(a); setDf(b); setHf(c)
    }
    run()
  }, [])
  if (!cw || !df || !hf) return <div>加载中...</div>
  return (
    <div>
      <WeatherCard weather={cw} cityName="上海市宝山区" />
      <ForecastList forecasts={df} />
      <HourlyForecast hourlyData={hf} />
    </div>
  )
}

describe('weather end-to-end flow', () => {
  it('renders composed weather views after service data', async () => {
    const stubService = {
      getCurrentWeather: vi.fn().mockResolvedValue(current),
      getWeatherForecast: vi.fn().mockResolvedValue(daily),
      getHourlyForecast: vi.fn().mockResolvedValue(hourly),
    }
    render(<WeatherContainer service={stubService} />)
    await waitFor(() => expect(screen.queryByText('加载中...')).not.toBeInTheDocument())
    expect(screen.getAllByText(/25°/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('上海市宝山区')).toBeInTheDocument()
    expect(screen.getByText('7天预报')).toBeInTheDocument()
    expect(screen.getByText('24小时预报')).toBeInTheDocument()
  })
})
