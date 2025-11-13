import { HttpClient } from '@/services/http-client'
import { CacheManager } from '@/utils/cache-manager'
import { QWEATHER_API_CONFIG, API_REQUEST_CONFIG } from '@/config/api-config'
import { ApiError, ERROR_CODES } from '@/utils/errors'
import type { QWeatherResponse, CurrentWeather, WeatherForecast, HourlyWeather } from '@/types/weather'

export class WeatherService {
  private httpClient: HttpClient
  private cacheManager: CacheManager

  constructor() {
    this.httpClient = new HttpClient(QWEATHER_API_CONFIG.BASE_URL)
    this.cacheManager = new CacheManager(API_REQUEST_CONFIG.CACHE_DURATION)
  }

  async getCurrentWeather(locationId: string, forceRefresh: boolean = false): Promise<CurrentWeather> {
    const cacheKey = `current_weather_${locationId}`
    if (!forceRefresh) {
      const cached = this.cacheManager.get<CurrentWeather>(cacheKey)
      if (cached) return cached
    }

    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_API_CONFIG.VERSION}${QWEATHER_API_CONFIG.ENDPOINTS.CURRENT_WEATHER}`,
      { location: locationId, key: API_REQUEST_CONFIG.API_KEY }
    )

    if (response.code === '204') {
      throw new ApiError('当前无数据', ERROR_CODES.DATA_NOT_FOUND)
    }
    if (response.code !== '200') {
      throw new ApiError(`API错误: ${response.code}`, ERROR_CODES.API_REQUEST_FAILED)
    }

    const weatherData = response.now as CurrentWeather
    this.cacheManager.set(cacheKey, weatherData, 30 * 60 * 1000)
    return weatherData
  }

  async getWeatherForecast(locationId: string, forceRefresh: boolean = false): Promise<WeatherForecast[]> {
    const cacheKey = `forecast_7d_${locationId}`
    if (!forceRefresh) {
      const cached = this.cacheManager.get<WeatherForecast[]>(cacheKey)
      if (cached) return cached
    }

    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_API_CONFIG.VERSION}${QWEATHER_API_CONFIG.ENDPOINTS.FORECAST_7D}`,
      { location: locationId, key: API_REQUEST_CONFIG.API_KEY }
    )

    if (response.code === '204') {
      throw new ApiError('预报无数据', ERROR_CODES.DATA_NOT_FOUND)
    }
    if (response.code !== '200') {
      throw new ApiError(`API错误: ${response.code}`, ERROR_CODES.API_REQUEST_FAILED)
    }

    const forecastData = response.daily as WeatherForecast[]
    this.cacheManager.set(cacheKey, forecastData, 2 * 60 * 60 * 1000)
    return forecastData
  }

  async getHourlyForecast(locationId: string, forceRefresh: boolean = false): Promise<HourlyWeather[]> {
    const cacheKey = `forecast_24h_${locationId}`
    if (!forceRefresh) {
      const cached = this.cacheManager.get<HourlyWeather[]>(cacheKey)
      if (cached) return cached
    }

    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_API_CONFIG.VERSION}${QWEATHER_API_CONFIG.ENDPOINTS.FORECAST_24H}`,
      { location: locationId, key: API_REQUEST_CONFIG.API_KEY }
    )

    if (response.code === '204') {
      throw new ApiError('逐小时无数据', ERROR_CODES.DATA_NOT_FOUND)
    }
    if (response.code !== '200') {
      throw new ApiError(`API错误: ${response.code}`, ERROR_CODES.API_REQUEST_FAILED)
    }

    const hourlyData = response.hourly as HourlyWeather[]
    this.cacheManager.set(cacheKey, hourlyData, 60 * 60 * 1000)
    return hourlyData
  }

  clearCache(): void {
    this.cacheManager.clear()
  }
}
