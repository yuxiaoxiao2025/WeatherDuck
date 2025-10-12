import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import {
  WeatherData,
  Location,
  CurrentWeather,
  ForecastData,
  HourlyForecast,
  LocationSearchResult,
  WeatherAlert,
} from "../types";

export class WeatherService {
  private apiKey: string;
  private baseUrl: string;
  private api: AxiosInstance;

  constructor() {
    // 在浏览器环境中使用import.meta.env，在Node.js环境中使用process.env
    this.apiKey = (typeof window !== 'undefined' 
      ? (import.meta.env?.VITE_QWEATHER_API_KEY || "6b95a713b2854ca0b5b62ac9d9cca3bb")
      : (typeof process !== 'undefined' && process?.env?.QWEATHER_API_KEY || "6b95a713b2854ca0b5b62ac9d9cca3bb")) as string;
    this.baseUrl = (typeof window !== 'undefined'
      ? (import.meta.env?.VITE_QWEATHER_BASE_URL || "https://nd2r6wuqd7.re.qweatherapi.com")
      : (typeof process !== 'undefined' && process?.env?.QWEATHER_BASE_URL || "https://nd2r6wuqd7.re.qweatherapi.com")) as string;

    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 请求拦截器
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        config.params = {
          ...config.params,
          key: this.apiKey,
        };
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.data.code !== "200") {
          throw new Error(
            `API Error: ${response.data.code} - ${this.getErrorMessage(response.data.code)}`,
          );
        }
        return response;
      },
      (error: AxiosError) => {
        console.error("Weather API Error:", error);
        throw new Error(`网络请求失败: ${error.message}`);
      },
    );
  }

  /**
   * 获取当前天气
   */
  async getCurrentWeather(locationQuery: string): Promise<WeatherData> {
    try {
      const response = await this.api.get("/v7/weather/now", {
        params: {
          location: locationQuery,
        },
      });

      const data = response.data;

      const location: Location = {
        name: data.location?.name || locationQuery,
        country: data.location?.country || "",
        region: data.location?.adm1 || "",
        lat: parseFloat(data.location?.lat || "0"),
        lon: parseFloat(data.location?.lon || "0"),
        timezone: data.location?.tz || "",
        localtime: data.location?.localtime || new Date().toISOString(),
      };

      const current: CurrentWeather = {
        temperature: parseInt(data.now?.temp || "0"),
        feelsLike: parseInt(data.now?.feelsLike || "0"),
        condition: {
          text: data.now?.text || "",
          icon: data.now?.icon || "",
          code: parseInt(data.now?.icon || "0"),
        },
        humidity: parseInt(data.now?.humidity || "0"),
        pressure: parseInt(data.now?.pressure || "0"),
        visibility: parseInt(data.now?.vis || "0"),
        uvIndex: parseInt(data.now?.uv || "0"),
        windSpeed: parseInt(data.now?.windSpeed || "0"),
        windDirection: parseInt(data.now?.windDir || "0"),
        windDegree: parseInt(data.now?.wind360 || "0"),
        cloudCover: parseInt(data.now?.cloud || "0"),
        isDay: data.now?.isDaytime === "1",
      };

      return {
        id: `${location.name}-${Date.now()}`,
        location,
        current,
        forecast: [],
        alerts: [],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("获取当前天气失败:", error);
      throw error;
    }
  }

  /**
   * 获取天气预报
   */
  async getForecast(locationQuery: string, days: number = 7): Promise<ForecastData[]> {
    try {
      const response = await this.api.get("/v7/weather/7d", {
        params: {
          location: locationQuery,
        },
      });

      const data = response.data;

      return (data.daily || []).slice(0, days).map((day: any): ForecastData => ({
        date: day.fxDate,
        day: {
          maxTemp: parseInt(day.tempMax),
          minTemp: parseInt(day.tempMin),
          avgTemp: Math.round((parseInt(day.tempMax) + parseInt(day.tempMin)) / 2),
          condition: {
            text: day.textDay,
            icon: day.iconDay,
            code: parseInt(day.iconDay),
          },
          humidity: parseInt(day.humidity),
          chanceOfRain: parseInt(day.pop || "0"),
          chanceOfSnow: 0, // 和风天气API没有单独的雪概率
          maxWindSpeed: parseInt(day.windSpeedDay),
          uvIndex: parseInt(day.uvIndex || "0"),
          sunrise: day.sunrise || "",
          sunset: day.sunset || "",
        },
        hour: [], // 小时预报需要单独获取
        astro: {
          sunrise: day.sunrise || "",
          sunset: day.sunset || "",
          moonrise: day.moonrise || "",
          moonset: day.moonset || "",
          moonPhase: day.moonPhase || "",
          moonIllumination: 0, // 和风天气API没有月亮照明度
        },
      }));
    } catch (error) {
      console.error("获取天气预报失败:", error);
      throw error;
    }
  }

  /**
   * 搜索城市
   */
  async searchCities(query: string): Promise<LocationSearchResult[]> {
    try {
      const response = await this.api.get("/v2/city/lookup", {
        params: {
          location: query,
        },
      });

      const data = response.data;

      return (data.location || []).map((city: any): LocationSearchResult => ({
        id: city.id,
        name: city.name,
        region: city.adm1,
        country: city.country,
        lat: parseFloat(city.lat),
        lon: parseFloat(city.lon),
        url: `${city.name}, ${city.adm1}, ${city.country}`,
      }));
    } catch (error) {
      console.error("搜索城市失败:", error);
      throw error;
    }
  }

  /**
   * 获取小时预报
   */
  async getHourlyForecast(locationQuery: string): Promise<HourlyForecast[]> {
    try {
      const response = await this.api.get("/v7/weather/24h", {
        params: {
          location: locationQuery,
        },
      });

      const data = response.data;

      return (data.hourly || []).map((hour: any): HourlyForecast => ({
        time: hour.fxTime,
        temperature: parseInt(hour.temp),
        feelsLike: parseInt(hour.feelsLike || hour.temp),
        condition: {
          text: hour.text,
          icon: hour.icon,
          code: parseInt(hour.icon),
        },
        windSpeed: parseInt(hour.windSpeed || "0"),
        windDirection: hour.windDir || "",
        humidity: parseInt(hour.humidity || "0"),
        pressure: parseInt(hour.pressure || "0"),
        cloudCover: parseInt(hour.cloud || "0"),
        chanceOfRain: parseInt(hour.pop || "0"),
        isDay: hour.isDaytime === "1",
      }));
    } catch (error) {
      console.error("获取小时预报失败:", error);
      throw error;
    }
  }

  /**
   * 获取天气指数
   */
  async getWeatherIndices(locationQuery: string): Promise<any> {
    try {
      const response = await this.api.get("/v7/indices/1d", {
        params: {
          location: locationQuery,
          type: "1,2,3,5,6,8,9", // 运动、洗车、穿衣、感冒、紫外线、旅游、花粉指数
        },
      });

      return response.data;
    } catch (error) {
      console.error("获取天气指数失败:", error);
      throw error;
    }
  }

  /**
   * 获取完整的天气数据（当前天气 + 预报）
   */
  async getCompleteWeatherData(locationQuery: string): Promise<WeatherData> {
    try {
      // 并行获取当前天气和预报数据
      const [currentWeather, forecast] = await Promise.all([
        this.getCurrentWeather(locationQuery),
        this.getForecast(locationQuery, 7),
      ]);

      return {
        ...currentWeather,
        forecast,
      };
    } catch (error) {
      console.error("获取完整天气数据失败:", error);
      throw error;
    }
  }

  /**
   * 获取天气预警
   */
  async getWeatherAlerts(locationQuery: string): Promise<WeatherAlert[]> {
    try {
      const response = await this.api.get("/v7/warning/now", {
        params: {
          location: locationQuery,
        },
      });

      const data = response.data;

      return (data.warning || []).map((alert: any): WeatherAlert => ({
        id: alert.id,
        title: alert.title,
        description: alert.text,
        severity: alert.level || 'moderate',
        urgency: 'expected',
        areas: alert.related ? alert.related.split(",") : [],
        category: alert.type || 'weather',
        certainty: 'likely',
        event: alert.title,
        effective: alert.startTime || new Date().toISOString(),
        expires: alert.endTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        desc: alert.text || alert.title,
      }));
    } catch (error) {
      console.error("获取天气预警失败:", error);
      return []; // 预警失败不影响主要功能
    }
  }

  /**
   * 获取错误信息
   */
  private getErrorMessage(code: string): string {
    const errorMessages: { [key: string]: string } = {
      "400": "请求错误",
      "401": "API密钥无效",
      "402": "超过访问次数或余额不足",
      "403": "无访问权限",
      "404": "查询的数据或地区不存在",
      "429": "超过限定的QPM",
      "500": "服务器内部错误",
    };

    return errorMessages[code] || `未知错误 (${code})`;
  }
}

// 创建并导出WeatherService单例
export const weatherService = new WeatherService();

// 默认导出
export default weatherService;
