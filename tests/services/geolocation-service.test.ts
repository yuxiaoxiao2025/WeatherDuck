import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GeolocationService } from '@/services/geolocation-service'

describe('GeolocationService', () => {
  let geoService: GeolocationService

  beforeEach(() => {
    geoService = new GeolocationService()
    // @ts-expect-error
    global.navigator.permissions = { query: vi.fn().mockResolvedValue({ state: 'granted' }) }
  })

  it('retries 3 times then succeeds', async () => {
    const mock = vi.fn()
    mock
      .mockImplementationOnce((_success, error) => error({ code: 3 }))
      .mockImplementationOnce((_success, error) => error({ code: 3 }))
      .mockImplementationOnce((success) => success({ coords: { latitude: 1, longitude: 2, accuracy: 10 } }))
    // @ts-expect-error
    global.navigator.geolocation = { getCurrentPosition: mock }
    const result = await geoService.getCurrentPositionWithRetry(3, 10)
    expect(result.latitude).toBe(1)
    expect(mock).toHaveBeenCalledTimes(3)
  })

  it('fails immediately on permission denied', async () => {
    const mock = vi.fn((_, error) => error({ code: 1 }))
    // @ts-expect-error
    global.navigator.geolocation = { getCurrentPosition: mock }
    await expect(geoService.getCurrentPositionWithRetry(3, 10)).rejects.toBeTruthy()
    expect(mock).toHaveBeenCalledTimes(1)
  })
})
