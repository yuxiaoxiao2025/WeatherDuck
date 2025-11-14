import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HourlyForecast } from '@/components/Weather/HourlyForecast'
import type { HourlyWeather } from '@/types/weather'

const nowIso = new Date().toISOString()
const nextHour = new Date()
nextHour.setHours(nextHour.getHours() + 1)

const sample: HourlyWeather[] = [
  {
    fxTime: nowIso,
    temp: '22',
    icon: '100',
    text: '晴',
    wind360: '90',
    windDir: '东风',
    windScale: '3',
    windSpeed: '15',
    humidity: '55',
    pop: '10',
    precip: '0.0',
    pressure: '1012',
    cloud: '20',
    dew: '12',
  },
  {
    fxTime: nextHour.toISOString(),
    temp: '21',
    icon: '305',
    text: '小雨',
    wind360: '90',
    windDir: '东风',
    windScale: '3',
    windSpeed: '14',
    humidity: '60',
    pop: '40',
    precip: '0.0',
    pressure: '1011',
    cloud: '30',
    dew: '11',
  },
]

describe('HourlyForecast', () => {
  it('renders now label and temperature', () => {
    render(<HourlyForecast hourlyData={sample} />)
    expect(screen.getByText('现在')).toBeInTheDocument()
    expect(screen.getByText(/22°/)).toBeInTheDocument()
  })
  it('shows precipitation probability when above threshold', () => {
    render(<HourlyForecast hourlyData={sample} />)
    expect(screen.getByText(/40%/)).toBeInTheDocument()
  })
})
