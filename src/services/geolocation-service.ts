import { ApiError, ERROR_CODES } from '@/utils/errors'
import { Logger } from '@/utils/logger'
import type { GeoLocation } from '@/types/city'

export class GeolocationService {
  private options: PositionOptions

  constructor() {
    this.options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  }

  async getCurrentPosition(): Promise<GeoLocation> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const err = new ApiError('浏览器不支持地理定位功能', ERROR_CODES.LOCATION_UNAVAILABLE)
        Logger.error('geolocation not supported', err.code)
        reject(err)
        return
      }
      navigator.geolocation.getCurrentPosition(
        position => {
          Logger.info('geolocation success', { accuracy: position.coords.accuracy })
          resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy })
        },
        error => {
          let errorCode: string
          let errorMessage: string
          switch (error.code) {
            case 1:
              errorCode = ERROR_CODES.LOCATION_PERMISSION_DENIED
              errorMessage = '用户拒绝了地理定位权限'
              break
            case 2:
              errorCode = ERROR_CODES.LOCATION_UNAVAILABLE
              errorMessage = '无法获取位置信息'
              break
            case 3:
              errorCode = ERROR_CODES.TIMEOUT_ERROR
              errorMessage = '获取位置信息超时'
              break
            default:
              errorCode = ERROR_CODES.LOCATION_UNAVAILABLE
              errorMessage = '未知的定位错误'
          }
          const err = new ApiError(errorMessage, errorCode)
          Logger.error('geolocation error', err.code)
          reject(err)
        },
        this.options
      )
    })
  }

  async getCurrentPositionWithRetry(retries: number = 3, delayMs: number = 2000): Promise<GeoLocation> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await this.getCurrentPosition()
      } catch (e: any) {
        const last = attempt >= retries - 1
        if (e?.code === ERROR_CODES.LOCATION_PERMISSION_DENIED) throw e
        if (last) throw e
        await new Promise(r => setTimeout(r, delayMs))
      }
    }
    throw new ApiError('定位重试失败', ERROR_CODES.LOCATION_UNAVAILABLE)
  }

  async checkPermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
      return 'prompt'
    }
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      return result.state
    } catch {
      return 'prompt'
    }
  }

  isSupported(): boolean {
    return 'geolocation' in navigator
  }
}
