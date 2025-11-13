import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WeatherService } from '@/services/weather-service'

vi.mock('@/services/http-client', () => {
  class MockHttpClient {
    get = vi.fn().mockResolvedValue({
      code: '200',
      now: {
        obsTime: '2024-01-01T12:00+08:00',
        temp: '18',
        feelsLike: '16',
        icon: '100',
        text: '晴',
        wind360: '90',
        windDir: '东风',
        windScale: '3',
        windSpeed: '15',
        humidity: '62',
        precip: '0.0',
        pressure: '1013',
        vis: '10',
        cloud: '25',
        dew: '12',
      },
    })
  }
  return { HttpClient: MockHttpClient }
})

describe('WeatherService', () => {
  let weatherService: WeatherService

  beforeEach(() => {
    weatherService = new WeatherService()
  })

  it('should get current weather successfully', async () => {
    const weather = await weatherService.getCurrentWeather('101020300')
    expect(weather).toBeDefined()
    expect(weather.temp).toBe('18')
    expect(weather.text).toBe('晴')
  })

  it('should use cache for repeated requests', async () => {
    const weather1 = await weatherService.getCurrentWeather('101020300')
    const weather2 = await weatherService.getCurrentWeather('101020300')
    expect(weather1).toEqual(weather2)
  })

  it('should force refresh when requested', async () => {
    const weather1 = await weatherService.getCurrentWeather('101020300', false)
    const weather2 = await weatherService.getCurrentWeather('101020300', true)
    expect(weather1).toBeDefined()
    expect(weather2).toBeDefined()
  })
})
