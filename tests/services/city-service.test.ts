import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CityService } from '@/services/city-service'

vi.mock('@/services/http-client', () => {
  class MockHttpClient {
    get = vi.fn().mockResolvedValue({
      code: '200',
      location: [
        {
          id: '101020300',
          name: '宝山区',
          lat: '31.40123',
          lon: '121.48941',
          adm2: '上海',
          adm1: '上海市',
          country: '中国',
          tz: 'Asia/Shanghai',
          utcOffset: '+08:00',
          isDst: '0',
          type: 'city',
          rank: '25',
          fxLink: 'https://www.qweather.com/weather/baoshan-101020300.html',
        },
      ],
    })
  }
  return { HttpClient: MockHttpClient }
})

describe('CityService', () => {
  let cityService: CityService

  beforeEach(() => {
    cityService = new CityService()
  })

  it('should search cities successfully', async () => {
    const cities = await cityService.searchCities({ location: '宝山' })
    expect(cities).toBeDefined()
    expect(cities.length).toBeGreaterThan(0)
    expect(cities[0].name).toBe('宝山区')
  })

  it('should get city by coordinates', async () => {
    const city = await cityService.getCityByCoordinates({ latitude: 31.40123, longitude: 121.48941 })
    expect(city).toBeDefined()
    expect(city.name).toBe('宝山区')
  })
})
