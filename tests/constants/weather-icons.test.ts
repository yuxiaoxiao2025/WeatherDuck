import { describe, it, expect } from 'vitest'
import { getWeatherIcon, WEATHER_ICON_MAP, getWeatherColor, WEATHER_COLOR_MAP } from '@/constants/weather-icons'

describe('weather-icons constants', () => {
  it('returns mapped icon for known code', () => {
    expect(getWeatherIcon('100')).toBe('Sun')
    expect(getWeatherIcon('302')).toBe('CloudLightning')
  })
  it('returns fallback icon for unknown code', () => {
    expect(getWeatherIcon('000')).toBe('HelpCircle')
  })
  it('includes color mapping for selected codes', () => {
    expect(getWeatherColor('100')).toMatch(/^#/) 
    expect(getWeatherColor('509')).toMatch(/^#/)
  })
  it('returns default color when code not mapped', () => {
    expect(getWeatherColor('000')).toBe('#3B82F6')
  })
  it('maps type safety via readonly constants', () => {
    expect(Object.keys(WEATHER_ICON_MAP).length).toBeGreaterThan(10)
    expect(Object.keys(WEATHER_COLOR_MAP).length).toBeGreaterThan(10)
  })
})
