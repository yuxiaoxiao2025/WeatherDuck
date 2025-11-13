import { describe, it, expect, vi } from 'vitest'
import { IpGeolocationService } from '@/services/ip-geolocation-service'

vi.mock('@/services/http-client', () => {
  class MockHttpClient {
    constructor(_: string) {}
    get = vi.fn().mockResolvedValue({ latitude: 31.23, longitude: 121.47 })
  }
  return { HttpClient: MockHttpClient }
})

describe('IpGeolocationService', () => {
  it('returns coordinates from first candidate', async () => {
    const svc = new IpGeolocationService()
    const loc = await svc.getLocation()
    expect(loc.latitude).toBe(31.23)
    expect(loc.longitude).toBe(121.47)
  })
})
