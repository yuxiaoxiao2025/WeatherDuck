# QWeather API 适配说明

- 基础配置：`src/config/api-config.ts`
  - `QWEATHER_API_CONFIG.BASE_URL` 默认 `https://devapi.qweather.com`
  - `QWEATHER_API_CONFIG.VERSION` `v7`
  - 端点：`/weather/now`、`/weather/7d`、`/weather/24h`
- Geo 配置：`QWEATHER_GEO_CONFIG`
  - `BASE_URL` 默认 `https://geoapi.qweather.com`
  - `VERSION` `v2` 或 `geo/v2`
  - 端点：`/city/lookup`、`/city/top`
- 请求配置：`API_REQUEST_CONFIG`
  - `API_KEY` 来自 `import.meta.env.VITE_QWEATHER_API_KEY`
  - `TIMEOUT`、`RETRY_TIMES`、`CACHE_DURATION`
- 默认城市：`DEFAULT_CITY_CONFIG`
  - `CITY_ID`、`CITY_NAME`

## 环境变量

- `VITE_QWEATHER_API_KEY` 必填，32位字符串
- `VITE_QWEATHER_API_HOST` 可选，HTTPS 主机
- `VITE_QWEATHER_GEO_API_HOST` 可选，HTTPS 主机
- `VITE_DEFAULT_CITY_ID`、`VITE_DEFAULT_CITY_NAME`

## 服务调用

```ts
import { WeatherService } from '@/services/weather-service'
const service = new WeatherService()
await service.getCurrentWeather('101020300')
await service.getWeatherForecast('101020300')
await service.getHourlyForecast('101020300')
```

## 错误与状态

- 成功：`code === '200'`
- 无数据：`code === '204'`
- 失败抛出：`ApiError`
