import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeatherDetail } from '@/components/Weather/WeatherDetail'
import type { CurrentWeather } from '@/types/weather'

const baseWeather: CurrentWeather = {
  obsTime: '2025-11-13T08:15+08:00',
  temp: '23',
  feelsLike: '22',
  icon: '100',
  text: '晴',
  wind360: '90',
  windDir: '东风',
  windScale: '3',
  windSpeed: '15',
  humidity: '55',
  precip: '0.0',
  pressure: '1012',
  vis: '10',
  cloud: '20',
  dew: '12',
}

describe('WeatherDetail', () => {
  it('renders 8 detail items', () => {
    render(<WeatherDetail weather={baseWeather} />)
    expect(screen.getByText('天气详情')).toBeInTheDocument()
    expect(screen.getByText('体感温度')).toBeInTheDocument()
    expect(screen.getByText('相对湿度')).toBeInTheDocument()
    expect(screen.getByText('风速')).toBeInTheDocument()
    expect(screen.getByText('风向')).toBeInTheDocument()
    expect(screen.getByText('气压')).toBeInTheDocument()
    expect(screen.getByText('能见度')).toBeInTheDocument()
    expect(screen.getByText('降水量')).toBeInTheDocument()
    expect(screen.getByText('云量')).toBeInTheDocument()
  })
})
