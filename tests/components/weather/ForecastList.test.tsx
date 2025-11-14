import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ForecastList } from '@/components/Weather/ForecastList'
import type { WeatherForecast } from '@/types/weather'

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const sample: WeatherForecast[] = [
  {
    fxDate: today.toISOString(),
    sunrise: '',
    sunset: '',
    moonrise: '',
    moonset: '',
    moonPhase: '',
    tempMax: '26',
    tempMin: '18',
    iconDay: '101',
    textDay: '多云',
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
  },
  {
    fxDate: tomorrow.toISOString(),
    sunrise: '',
    sunset: '',
    moonrise: '',
    moonset: '',
    moonPhase: '',
    tempMax: '24',
    tempMin: '16',
    iconDay: '305',
    textDay: '小雨',
    iconNight: '104',
    textNight: '阴',
    wind360Day: '45',
    windDirDay: '东北风',
    windScaleDay: '3',
    windSpeedDay: '14',
    wind360Night: '180',
    windDirNight: '南风',
    windScaleNight: '2',
    windSpeedNight: '10',
    humidity: '70',
    precip: '0.3',
    pressure: '1009',
    vis: '9',
    cloud: '40',
    uvIndex: '3',
  },
]

describe('ForecastList', () => {
  it('renders today and tomorrow labels', () => {
    render(<ForecastList forecasts={sample} />)
    expect(screen.getByText('今天')).toBeInTheDocument()
    expect(screen.getByText('明天')).toBeInTheDocument()
  })
  it('renders temperature range and text', () => {
    render(<ForecastList forecasts={sample} />)
    expect(screen.getByText(/26°/)).toBeInTheDocument()
    expect(screen.getByText(/18°/)).toBeInTheDocument()
    expect(screen.getByText('多云')).toBeInTheDocument()
  })
})
