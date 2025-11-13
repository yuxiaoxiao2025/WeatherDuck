function normalizeUrl(u: string): string {
  try {
    const url = new URL(u)
    return `${url.protocol}//${url.host}`
  } catch {
    return u.replace(/\/$/, '')
  }
}

export const QWEATHER_API_CONFIG = {
  BASE_URL: normalizeUrl(import.meta.env.VITE_QWEATHER_API_HOST || 'https://devapi.qweather.com'),
  VERSION: 'v7',
  ENDPOINTS: {
    CURRENT_WEATHER: '/weather/now',
    FORECAST_7D: '/weather/7d',
    FORECAST_24H: '/weather/24h',
    AIR_QUALITY: '/air/now',
    WARNING: '/warning/now',
  },
} as const

const isDedicatedHost = (u: string) => /qweatherapi\.com$/.test(new URL(u).host)

export const QWEATHER_GEO_CONFIG = {
  BASE_URL: normalizeUrl(import.meta.env.VITE_QWEATHER_GEO_API_HOST || 'https://geoapi.qweather.com'),
  VERSION: isDedicatedHost(import.meta.env.VITE_QWEATHER_GEO_API_HOST || 'https://geoapi.qweather.com') ? 'geo/v2' : 'v2',
  ENDPOINTS: {
    CITY_LOOKUP: '/city/lookup',
    CITY_TOP: '/city/top',
    POI_LOOKUP: '/poi/lookup',
    POI_RANGE: '/poi/range',
  },
} as const

export const API_REQUEST_CONFIG = {
  API_KEY: import.meta.env.VITE_QWEATHER_API_KEY || '',
  TIMEOUT: Math.max(1000, Number(import.meta.env.VITE_API_TIMEOUT) || 10000),
  RETRY_TIMES: Math.max(1, Number(import.meta.env.VITE_API_RETRY_TIMES) || 3),
  CACHE_DURATION: Math.max(0, Number(import.meta.env.VITE_API_CACHE_DURATION) || 1800000),
} as const

export const DEFAULT_CITY_CONFIG = {
  CITY_ID: String(import.meta.env.VITE_DEFAULT_CITY_ID || '101020300'),
  CITY_NAME: String(import.meta.env.VITE_DEFAULT_CITY_NAME || '上海市宝山区'),
} as const

export function validateApiConfig(): boolean {
  if (!API_REQUEST_CONFIG.API_KEY || API_REQUEST_CONFIG.API_KEY.length !== 32) {
    console.error('缺少或非法的和风天气 API 密钥')
    return false
  }
  if (!QWEATHER_API_CONFIG.BASE_URL.startsWith('https://')) {
    console.error('API Host 必须使用 HTTPS')
    return false
  }
  return true
}
