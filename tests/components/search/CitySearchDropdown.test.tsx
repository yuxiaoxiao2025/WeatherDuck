import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import type { CityInfo } from '@/types/city'
import type { CurrentWeather, WeatherForecast, HourlyWeather } from '@/types/weather'

const cityList: CityInfo[] = [
  { id: '101020300', name: '宝山', lat: '31.39890', lon: '121.48994', adm2: '上海市', adm1: '上海市', country: '中国', tz: 'Asia/Shanghai', utcOffset: '+08:00', isDst: '0', type: 'city', rank: '10', fxLink: '' },
  { id: '101020100', name: '上海', lat: '31.23170', lon: '121.47264', adm2: '上海市', adm1: '上海市', country: '中国', tz: 'Asia/Shanghai', utcOffset: '+08:00', isDst: '0', type: 'city', rank: '10', fxLink: '' },
]

const current: CurrentWeather = {
  obsTime: new Date().toISOString(),
  temp: '15',
  feelsLike: '13',
  icon: '100',
  text: '晴',
  wind360: '0',
  windDir: '北风',
  windScale: '3',
  windSpeed: '13',
  humidity: '68',
  precip: '0.0',
  pressure: '1021',
  vis: '26',
  cloud: '0',
  dew: '10',
}

const daily: WeatherForecast[] = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date(); d.setDate(d.getDate() + i)
  return {
    fxDate: d.toISOString(), sunrise: '', sunset: '', moonrise: '', moonset: '', moonPhase: '',
    tempMax: String(20 - i), tempMin: String(11 - i), iconDay: i % 2 === 0 ? '100' : '101', textDay: i % 2 === 0 ? '晴' : '多云',
    iconNight: '104', textNight: '阴', wind360Day: '90', windDirDay: '东风', windScaleDay: '3', windSpeedDay: '15',
    wind360Night: '180', windDirNight: '南风', windScaleNight: '2', windSpeedNight: '10', humidity: '60', precip: '0.1', pressure: '1010', vis: '10', cloud: '30', uvIndex: '4',
  }
})

const hourly: HourlyWeather[] = Array.from({ length: 24 }).map((_, i) => {
  const d = new Date(); d.setHours(d.getHours() + i)
  return {
    fxTime: d.toISOString(), temp: String(14 + (i % 5)), icon: '100', text: '晴', wind360: '0', windDir: '北风', windScale: '3', windSpeed: '10', humidity: '55', pop: '20', precip: '0.0', pressure: '1012', cloud: '20', dew: '12',
  }
})

vi.mock('@/services/city-service', () => ({
  CityService: class {
    searchCities = vi.fn().mockResolvedValue(cityList)
    getCityByCoordinates = vi.fn()
  }
}))

vi.mock('@/services/weather-service', () => ({
  WeatherService: class {
    getCurrentWeather = vi.fn().mockResolvedValue(current)
    getWeatherForecast = vi.fn().mockResolvedValue(daily)
    getHourlyForecast = vi.fn().mockResolvedValue(hourly)
  }
}))

describe('City search dropdown interactions', () => {
  it('shows suggestions and selects a city by mouse', async () => {
    render(<App />)
    const input = await screen.findByPlaceholderText('输入城市名称进行搜索')
    await userEvent.type(input, '上海')
    await waitFor(() => expect(screen.getByText('宝山')).toBeInTheDocument())
    const baoshanBtn = screen.getByText('宝山').closest('button')!
    await userEvent.click(baoshanBtn)
    await waitFor(() => expect(screen.getAllByRole('heading', { name: '宝山' }).length).toBeGreaterThan(0))
    await waitFor(() => expect((input as HTMLInputElement).value).toBe('宝山'))
  })

  it('clears input and hides dropdown', async () => {
    render(<App />)
    const input = await screen.findByPlaceholderText('输入城市名称进行搜索')
    await userEvent.type(input, '上海')
    await waitFor(() => expect(screen.getByText('上海')).toBeInTheDocument())
    const clearBtn = screen.getByRole('button', { name: '清除' })
    await userEvent.click(clearBtn)
    expect((input as HTMLInputElement).value).toBe('')
  })
})
