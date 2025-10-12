// 天气数据相关类型定义

export interface WeatherData {
  id: string;
  location: Location;
  current: CurrentWeather;
  forecast: ForecastData[];
  alerts?: WeatherAlert[];
  lastUpdated: string;
}

export interface Location {
  name: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  timezone: string;
  localtime: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: WeatherCondition;
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  windSpeed: number;
  windDirection: number;
  windDegree: number;
  cloudCover: number;
  isDay: boolean;
}

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface ForecastData {
  date: string;
  day: DayForecast;
  hour: HourlyForecast[];
  astro: AstroData;
}

export interface DayForecast {
  maxTemp: number;
  minTemp: number;
  avgTemp: number;
  condition: WeatherCondition;
  humidity: number;
  chanceOfRain: number;
  chanceOfSnow: number;
  maxWindSpeed: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  condition: WeatherCondition;
  humidity: number;
  chanceOfRain: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  cloudCover: number;
  isDay: boolean;
}

export interface AstroData {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: string;
  moonIllumination: number;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  urgency: 'immediate' | 'expected' | 'future' | 'past';
  areas: string[];
  category: string;
  certainty: 'observed' | 'likely' | 'possible' | 'unlikely' | 'unknown';
  event: string;
  note?: string;
  effective: string;
  expires: string;
  desc: string;
  instruction?: string;
}

// API响应类型
export interface WeatherApiResponse {
  location: Location;
  current: any; // 原始API响应
  forecast: any; // 原始API响应
  alerts?: any; // 原始API响应
}

// 搜索相关类型
export interface LocationSearchResult {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}

export interface SearchLocationParams {
  query: string;
  limit?: number;
}