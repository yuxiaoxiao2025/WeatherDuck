export interface CityInfo {
  id: string
  name: string
  lat: string
  lon: string
  adm2: string
  adm1: string
  country: string
  tz: string
  utcOffset: string
  isDst: string
  type: string
  rank: string
  fxLink: string
}

export interface CitySearchParams {
  location: string
  adm?: string
  range?: 'world' | 'cn' | 'us' | 'eu'
  number?: number
  lang?: 'zh' | 'en'
}

export interface GeoLocation {
  latitude: number
  longitude: number
  accuracy?: number
}
