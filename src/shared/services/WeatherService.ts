import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// 天气数据接口定义
export interface WeatherData {
  location: {
    name: string;
    country: string;
    region: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    visibility: number;
    windSpeed: number;
    windDir: string;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    updateTime: string;
  };
}

export interface ForecastData {
  location: WeatherData["location"];
  forecast: {
    date: string;
    day: {
      maxTemp: number;
      minTemp: number;
      condition: {
        text: string;
        icon: string;
        code: number;
      };
      humidity: number;
      windSpeed: number;
    };
    hour: Array<{
      time: string;
      temp: number;
      condition: {
        text: string;
        icon: string;
        code: number;
      };
      windSpeed: number;
      humidity: number;
    }>;
  }[];
}

export interface CityInfo {
  name: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  id: string;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl: string;
  private httpClient: AxiosInstance;

  constructor() {
    this.apiKey =
      process.env.QWEATHER_API_KEY || "6b95a713b2854ca0b5b62ac9d9cca3bb";
    this.baseUrl =
      process.env.QWEATHER_BASE_URL || "https://nd2r6wuqd7.re.qweatherapi.com";

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 请求拦截器
    this.httpClient.interceptors.request.use(
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
    this.httpClient.interceptors.response.use(
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
  async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      const response = await this.httpClient.get("/v7/weather/now", {
        params: {
          location: location,
        },
      });

      const data = response.data;

      return {
        location: {
          name: data.location?.name || location,
          country: data.location?.country || "",
          region: data.location?.adm1 || "",
          lat: parseFloat(data.location?.lat || "0"),
          lon: parseFloat(data.location?.lon || "0"),
        },
        current: {
          temp: parseInt(data.now?.temp || "0"),
          feelsLike: parseInt(data.now?.feelsLike || "0"),
          humidity: parseInt(data.now?.humidity || "0"),
          pressure: parseInt(data.now?.pressure || "0"),
          visibility: parseInt(data.now?.vis || "0"),
          windSpeed: parseInt(data.now?.windSpeed || "0"),
          windDir: data.now?.windDir || "",
          condition: {
            text: data.now?.text || "",
            icon: data.now?.icon || "",
            code: parseInt(data.now?.icon || "0"),
          },
          updateTime: data.updateTime || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("获取当前天气失败:", error);
      throw error;
    }
  }

  /**
   * 获取天气预报
   */
  async getForecast(location: string, days: number = 7): Promise<ForecastData> {
    try {
      const response = await this.httpClient.get("/v7/weather/7d", {
        params: {
          location: location,
        },
      });

      const data = response.data;

      return {
        location: {
          name: data.location?.name || location,
          country: data.location?.country || "",
          region: data.location?.adm1 || "",
          lat: parseFloat(data.location?.lat || "0"),
          lon: parseFloat(data.location?.lon || "0"),
        },
        forecast: (data.daily || []).slice(0, days).map((day: any) => ({
          date: day.fxDate,
          day: {
            maxTemp: parseInt(day.tempMax),
            minTemp: parseInt(day.tempMin),
            condition: {
              text: day.textDay,
              icon: day.iconDay,
              code: parseInt(day.iconDay),
            },
            humidity: parseInt(day.humidity),
            windSpeed: parseInt(day.windSpeedDay),
          },
          hour: [], // 小时预报需要单独接口
        })),
      };
    } catch (error) {
      console.error("获取天气预报失败:", error);
      throw error;
    }
  }

  /**
   * 搜索城市
   */
  async searchCities(query: string): Promise<CityInfo[]> {
    try {
      const response = await this.httpClient.get("/v2/city/lookup", {
        params: {
          location: query,
        },
      });

      const data = response.data;

      return (data.location || []).map((city: any) => ({
        name: city.name,
        country: city.country,
        region: city.adm1,
        lat: parseFloat(city.lat),
        lon: parseFloat(city.lon),
        id: city.id,
      }));
    } catch (error) {
      console.error("搜索城市失败:", error);
      throw error;
    }
  }

  /**
   * 获取小时预报
   */
  async getHourlyForecast(location: string): Promise<any> {
    try {
      const response = await this.httpClient.get("/v7/weather/24h", {
        params: {
          location: location,
        },
      });

      return response.data;
    } catch (error) {
      console.error("获取小时预报失败:", error);
      throw error;
    }
  }

  /**
   * 获取天气指数
   */
  async getWeatherIndices(location: string): Promise<any> {
    try {
      const response = await this.httpClient.get("/v7/indices/1d", {
        params: {
          location: location,
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
