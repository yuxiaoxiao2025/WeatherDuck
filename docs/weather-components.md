# 天气组件使用说明

## 导入

```ts
import { WeatherCard, ForecastList, HourlyForecast, WeatherDetail } from '@/components/Weather'
```

## WeatherCard

```tsx
<WeatherCard weather={currentWeather} cityName="上海市宝山区" />
```

- 展示温度、体感、天气描述、湿度、风速、气压、能见度
- 自动映射图标与颜色

## ForecastList

```tsx
<ForecastList forecasts={forecast7d} />
```

- 展示未来 7 天预报
- 显示今天、明天、周几与温度范围

## HourlyForecast

```tsx
<HourlyForecast hourlyData={forecast24h} />
```

- 横向滚动展示 24 小时预报
- 显示现在或 HH:mm、降水概率、风向风速

## WeatherDetail

```tsx
<WeatherDetail weather={currentWeather} />
```

- 以 2x2 网格展示 8 项指标

## 图标与颜色映射

```ts
import { getWeatherIcon, getWeatherColor } from '@/constants/weather-icons'
getWeatherIcon(code)
getWeatherColor(code)
```

## 集成示例

```tsx
import { WeatherService } from '@/services/weather-service'
const s = new WeatherService()
const cw = await s.getCurrentWeather('101020300')
const df = await s.getWeatherForecast('101020300')
const hf = await s.getHourlyForecast('101020300')
<WeatherCard weather={cw} cityName="上海市宝山区" />
<ForecastList forecasts={df} />
<HourlyForecast hourlyData={hf} />
<WeatherDetail weather={cw} />
```
