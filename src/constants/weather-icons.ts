import type { IconName } from '@/components/Icon'

export const WEATHER_ICON_MAP: Record<string, IconName> = {
  '100': 'Sun',
  '101': 'CloudSun',
  '102': 'Cloud',
  '103': 'Cloud',
  '104': 'Cloud',
  '300': 'CloudDrizzle',
  '301': 'CloudRain',
  '302': 'CloudLightning',
  '303': 'CloudLightning',
  '304': 'CloudRainWind',
  '305': 'CloudDrizzle',
  '306': 'CloudRain',
  '307': 'CloudRain',
  '308': 'CloudRain',
  '309': 'CloudDrizzle',
  '310': 'CloudRain',
  '311': 'CloudRain',
  '312': 'CloudRain',
  '313': 'CloudRainWind',
  '314': 'CloudDrizzle',
  '315': 'CloudRain',
  '316': 'CloudRain',
  '317': 'CloudRain',
  '318': 'CloudRain',
  '400': 'CloudSnow',
  '401': 'Snowflake',
  '402': 'CloudSnow',
  '403': 'CloudSnow',
  '404': 'CloudDrizzle',
  '405': 'CloudSnow',
  '406': 'CloudSnow',
  '407': 'Snowflake',
  '408': 'Snowflake',
  '409': 'CloudSnow',
  '410': 'CloudSnow',
  '456': 'CloudSnow',
  '457': 'CloudSnow',
  '500': 'CloudFog',
  '501': 'CloudFog',
  '502': 'CloudFog',
  '503': 'Wind',
  '504': 'Wind',
  '507': 'Wind',
  '508': 'Wind',
  '509': 'CloudFog',
  '510': 'CloudFog',
  '511': 'CloudFog',
  '512': 'CloudFog',
  '513': 'CloudFog',
  '514': 'CloudFog',
  '515': 'CloudFog',
  '900': 'Thermometer',
  '901': 'Snowflake',
  '999': 'HelpCircle',
} as const

export function getWeatherIcon(code: string): IconName {
  const mapped = WEATHER_ICON_MAP[code]
  if (mapped) return mapped
  const n = Number(code)
  if (Number.isNaN(n)) return 'HelpCircle'
  const family = Math.floor(n / 100)
  if (family === 1) return 'CloudSun'
  if (family === 3) return 'CloudRain'
  if (family === 4) return 'CloudSnow'
  if (family === 5) return 'CloudFog'
  if (family === 9) return 'Thermometer'
  return 'HelpCircle'
}

export const WEATHER_COLOR_MAP: Record<string, string> = {
  '100': '#FFB300',
  '101': '#FFA000',
  '102': '#FF8F00',
  '103': '#FF6F00',
  '104': '#78909C',
  '300': '#42A5F5',
  '301': '#1E88E5',
  '302': '#1565C0',
  '303': '#0D47A1',
  '305': '#64B5F6',
  '306': '#42A5F5',
  '307': '#1E88E5',
  '308': '#1565C0',
  '310': '#1565C0',
  '311': '#0D47A1',
  '312': '#0D47A1',
  '400': '#E3F2FD',
  '405': '#BBDEFB',
  '406': '#90CAF9',
  '407': '#64B5F6',
  '408': '#42A5F5',
  '500': '#B0BEC5',
  '501': '#90A4AE',
  '502': '#78909C',
  '509': '#607D8B',
  '510': '#546E7A',
} as const

export function getWeatherColor(code: string): string {
  const mapped = WEATHER_COLOR_MAP[code]
  if (mapped) return mapped
  const n = Number(code)
  if (Number.isNaN(n)) return '#3B82F6'
  const family = Math.floor(n / 100)
  if (family === 1) return '#FFB300'
  if (family === 3) return '#42A5F5'
  if (family === 4) return '#90CAF9'
  if (family === 5) return '#78909C'
  if (family === 9) return '#FF6B6B'
  return '#3B82F6'
}
