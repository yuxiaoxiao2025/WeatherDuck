import { HttpClient } from '@/services/http-client'
import { CacheManager } from '@/utils/cache-manager'
import { QWEATHER_GEO_CONFIG, API_REQUEST_CONFIG } from '@/config/api-config'
import { ApiError, ERROR_CODES } from '@/utils/errors'
import type { QWeatherResponse } from '@/types/weather'
import type { CityInfo, CitySearchParams, GeoLocation } from '@/types/city'

export class CityService {
  private httpClient: HttpClient
  private cacheManager: CacheManager

  constructor() {
    this.httpClient = new HttpClient(QWEATHER_GEO_CONFIG.BASE_URL)
    this.cacheManager = new CacheManager()
  }

  async searchCities(params: CitySearchParams): Promise<CityInfo[]> {
    const query = (params.location || '').trim()
    if (!query) {
      throw new ApiError('搜索关键词为空', ERROR_CODES.DATA_INVALID)
    }
    const number = Math.min(20, Math.max(1, params.number || 10))
    const cacheKey = `city_search_${query}_${params.adm || ''}_${number}`

    const cached = this.cacheManager.get<CityInfo[]>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_GEO_CONFIG.VERSION}${QWEATHER_GEO_CONFIG.ENDPOINTS.CITY_LOOKUP}`,
      {
        location: query,
        key: API_REQUEST_CONFIG.API_KEY,
        adm: params.adm,
        range: params.range || 'cn',
        number,
        lang: params.lang || 'zh',
      }
    )

    if (response.code === '204') {
      throw new ApiError('搜索无结果', ERROR_CODES.CITY_NOT_FOUND)
    }
    if (response.code !== '200') {
      throw new ApiError(`城市搜索失败: ${response.code}`, ERROR_CODES.API_REQUEST_FAILED, undefined, QWEATHER_GEO_CONFIG.ENDPOINTS.CITY_LOOKUP)
    }

    const cities = response.location as CityInfo[]
    if (!cities || cities.length === 0) {
      throw new ApiError('未找到匹配的城市', ERROR_CODES.CITY_NOT_FOUND)
    }
    this.cacheManager.set(cacheKey, cities, 60 * 60 * 1000)
    return cities
  }

  async getTopCities(range: 'world' | 'cn' = 'cn', number: number = 20): Promise<CityInfo[]> {
    const count = Math.min(20, Math.max(1, number))
    const cacheKey = `top_cities_${range}_${count}`

    const cached = this.cacheManager.get<CityInfo[]>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_GEO_CONFIG.VERSION}${QWEATHER_GEO_CONFIG.ENDPOINTS.CITY_TOP}`,
      { key: API_REQUEST_CONFIG.API_KEY, range, number: count, lang: 'zh' }
    )

    if (response.code === '204') {
      throw new ApiError('热门城市无数据', ERROR_CODES.DATA_NOT_FOUND)
    }
    if (response.code !== '200') {
      throw new ApiError(`获取热门城市失败: ${response.code}`, ERROR_CODES.API_REQUEST_FAILED)
    }

    const cities = response.topCityList as CityInfo[]
    this.cacheManager.set(cacheKey, cities, 24 * 60 * 60 * 1000)
    return cities
  }

  async getCityByCoordinates(location: GeoLocation): Promise<CityInfo> {
    const locationStr = `${location.longitude},${location.latitude}`
    const cacheKey = `city_coords_${locationStr}`

    const cached = this.cacheManager.get<CityInfo>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.httpClient.get<QWeatherResponse<any>>(
      `${QWEATHER_GEO_CONFIG.VERSION}${QWEATHER_GEO_CONFIG.ENDPOINTS.CITY_LOOKUP}`,
      { location: locationStr, key: API_REQUEST_CONFIG.API_KEY, lang: 'zh' }
    )

    if (response.code === '204') {
      throw new ApiError('坐标查询无数据', ERROR_CODES.CITY_NOT_FOUND)
    }
    if (response.code !== '200') {
      throw new ApiError(`根据坐标查询城市失败: ${response.code}`, ERROR_CODES.API_REQUEST_FAILED)
    }

    const cities = response.location as CityInfo[]
    if (!cities || cities.length === 0) {
      throw new ApiError('未找到对应的城市', ERROR_CODES.CITY_NOT_FOUND)
    }
    const city = cities[0]
    this.cacheManager.set(cacheKey, city, 6 * 60 * 60 * 1000)
    return city
  }

  clearCache(): void {
    this.cacheManager.clear()
  }
}
