export interface QWeatherResponse<T> {
  code: string
  updateTime?: string
  fxLink?: string
  [key: string]: T | string | undefined
}

export interface CurrentWeather {
  obsTime: string
  temp: string
  feelsLike: string
  icon: string
  text: string
  wind360: string
  windDir: string
  windScale: string
  windSpeed: string
  humidity: string
  precip: string
  pressure: string
  vis: string
  cloud: string
  dew: string
}

export interface WeatherForecast {
  fxDate: string
  sunrise: string
  sunset: string
  moonrise: string
  moonset: string
  moonPhase: string
  tempMax: string
  tempMin: string
  iconDay: string
  textDay: string
  iconNight: string
  textNight: string
  wind360Day: string
  windDirDay: string
  windScaleDay: string
  windSpeedDay: string
  wind360Night: string
  windDirNight: string
  windScaleNight: string
  windSpeedNight: string
  humidity: string
  precip: string
  pressure: string
  vis: string
  cloud: string
  uvIndex: string
}

export interface HourlyWeather {
  fxTime: string
  temp: string
  icon: string
  text: string
  wind360: string
  windDir: string
  windScale: string
  windSpeed: string
  humidity: string
  pop: string
  precip: string
  pressure: string
  cloud: string
  dew: string
}

export interface AirQuality {
  pubTime: string
  aqi: string
  level: string
  category: string
  primary: string
  pm10: string
  pm2p5: string
  no2: string
  so2: string
  co: string
  o3: string
}
