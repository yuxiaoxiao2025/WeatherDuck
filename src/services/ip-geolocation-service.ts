import { HttpClient } from '@/services/http-client'
import type { GeoLocation } from '@/types/city'
import { ApiError, ERROR_CODES } from '@/utils/errors'

export class IpGeolocationService {
  async getLocation(): Promise<GeoLocation> {
    const candidates = [
      { base: 'https://ipapi.co', endpoint: '/json', parse: (d: any) => ({ latitude: d.latitude, longitude: d.longitude }) },
      { base: 'https://ipinfo.io', endpoint: '/json', parse: (d: any) => { const [lat, lon] = String(d.loc || '').split(','); return ({ latitude: Number(lat), longitude: Number(lon) }) } },
      { base: 'https://ip-api.com', endpoint: '/json', parse: (d: any) => ({ latitude: d.lat, longitude: d.lon }) },
    ]
    for (const c of candidates) {
      try {
        const client = new HttpClient(c.base)
        const data = await client.get<any>(c.endpoint)
        const loc = c.parse(data)
        if (isFinite(loc.latitude) && isFinite(loc.longitude)) return { latitude: loc.latitude, longitude: loc.longitude }
      } catch {}
    }
    throw new ApiError('IP定位失败', ERROR_CODES.LOCATION_UNAVAILABLE)
  }
}
