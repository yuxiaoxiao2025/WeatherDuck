import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeatherCard } from '@/components/Weather/WeatherCard'
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

describe('WeatherCard', () => {
  it('renders temperature and description', () => {
    render(<WeatherCard weather={baseWeather} cityName="上海市宝山区" />)
    expect(screen.getByText(/23°/)).toBeInTheDocument()
    expect(screen.getByText('晴')).toBeInTheDocument()
    expect(screen.getByText('体感 22°')).toBeInTheDocument()
  })
  it('renders metrics grid', () => {
    render(<WeatherCard weather={baseWeather} />)
    expect(screen.getByText('湿度')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
    expect(screen.getByText('风速')).toBeInTheDocument()
    expect(screen.getByText(/15km\/h/)).toBeInTheDocument()
    expect(screen.getByText('气压')).toBeInTheDocument()
    expect(screen.getByText(/1012hPa/)).toBeInTheDocument()
    expect(screen.getByText('能见度')).toBeInTheDocument()
    expect(screen.getByText(/10km/)).toBeInTheDocument()
  })
})
