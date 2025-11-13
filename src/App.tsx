import React, { useState, useEffect } from 'react'
import { AppContainer, Header } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { ThemeToggle } from '@/components/ThemeToggle'
import { WeatherService } from '@/services/weather-service'
import { CityService } from '@/services/city-service'
import { GeolocationService } from '@/services/geolocation-service'
import { IpGeolocationService } from '@/services/ip-geolocation-service'
import { validateApiConfig, DEFAULT_CITY_CONFIG } from '@/config/api-config'
import { Storage } from '@/utils/storage'
import { Logger } from '@/utils/logger'
import type { CurrentWeather } from '@/types/weather'
import type { CityInfo } from '@/types/city'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentCity, setCurrentCity] = useState<CityInfo | null>(null)
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null)
  const [error, setError] = useState<string>('')

  const weatherService = new WeatherService()
  const cityService = new CityService()
  const geoService = new GeolocationService()
  const ipGeoService = new IpGeolocationService()

  useEffect(() => {
    if (!validateApiConfig()) {
      setError('API配置错误，请检查环境变量')
    }
    const lastCity = Storage.getJSON<CityInfo>('last_city')
    if (lastCity) {
      setCurrentCity(lastCity)
    }
  }, [])

  const handleGetLocationWeather = async () => {
    setIsLoading(true)
    setError('')
    try {
      const position = await geoService.getCurrentPositionWithRetry(3, 2000)
      const city = await cityService.getCityByCoordinates(position)
      setCurrentCity(city)
      Storage.setJSON('last_city', city)
      const weather = await weatherService.getCurrentWeather(city.id)
      setCurrentWeather(weather)
    } catch (err: any) {
      Logger.error('定位流程失败', err?.code, { message: err?.message })
      const fallbackCity = Storage.getJSON<CityInfo>('last_city')
      try {
        if (fallbackCity) {
          const weather = await weatherService.getCurrentWeather(fallbackCity.id)
          setCurrentCity(fallbackCity)
          setCurrentWeather(weather)
          setError('无法获取当前位置，已显示上海天气')
        } else {
          try {
            const ipLoc = await ipGeoService.getLocation()
            const ipCity = await cityService.getCityByCoordinates(ipLoc)
            Storage.setJSON('last_city', ipCity)
            const weather = await weatherService.getCurrentWeather(ipCity.id)
            setCurrentCity(ipCity)
            setCurrentWeather(weather)
            setError('定位超时，已根据IP定位显示天气')
            return
          } catch {}
          const cities = await cityService.searchCities({ location: '上海', range: 'cn' })
          if (cities.length > 0) {
            const city = cities[0]
            setCurrentCity(city)
            Storage.setJSON('last_city', city)
            const weather = await weatherService.getCurrentWeather(city.id)
            setCurrentWeather(weather)
            setError('无法获取当前位置，已显示上海天气')
          } else {
            setError(err.message || '获取天气信息失败')
          }
        }
      } catch {
        setError(err.message || '获取天气信息失败')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchCity = async () => {
    setIsLoading(true)
    setError('')
    try {
      const cities = await cityService.searchCities({ location: '北京', range: 'cn' })
      if (cities.length > 0) {
        const city = cities[0]
        setCurrentCity(city)
        const weather = await weatherService.getCurrentWeather(city.id)
        setCurrentWeather(weather)
      }
    } catch (err: any) {
      setError(err.message || '搜索城市失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!currentCity) {
      setError('请先选择城市')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const weather = await weatherService.getCurrentWeather(currentCity.id, true)
      setCurrentWeather(weather)
    } catch (err: any) {
      setError(err.message || '刷新失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppContainer>
      <Header title="天气鸭" subtitle="API集成测试" onRefresh={currentWeather ? handleRefresh : undefined} />
      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="mb-2">
          <ThemeToggle initial="system" />
        </div>
        <Card variant="glass">
          <h3 className="text-lg font-bold text-blue-900 mb-3">API功能测试</h3>
          <div className="space-y-2">
            <Button variant="primary" className="w-full" leftIcon={<Icon name="MapPin" size={18} />} onClick={handleGetLocationWeather} isLoading={isLoading}>获取当前位置天气</Button>
            <Button variant="secondary" className="w-full" leftIcon={<Icon name="Search" size={18} />} onClick={handleSearchCity} isLoading={isLoading}>搜索城市（北京）</Button>
          </div>
        </Card>
        {error && (
          <Card variant="elevated" className="bg-red-50 border-2 border-red-200">
            <div className="flex items-start space-x-3">
              <Icon name="AlertCircle" size={20} color="#ef4444" />
              <div>
                <h4 className="font-bold text-red-900">错误</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </Card>
        )}
        {currentCity && (
          <Card variant="glass">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-blue-900">
                <Icon name="MapPin" size={20} className="inline mr-2" />
                {currentCity.name}
              </h3>
              <span className="text-sm text-blue-600">{currentCity.adm1}</span>
            </div>
            <p className="text-xs text-blue-500">ID: {currentCity.id} | 经纬度: {currentCity.lon}, {currentCity.lat}</p>
          </Card>
        )}
        {currentWeather && (
          <Card variant="glass">
            <h3 className="text-lg font-bold text-blue-900 mb-3">当前天气</h3>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-blue-900">{currentWeather.temp}°C</div>
              <div className="text-xl text-blue-600 mt-2">{currentWeather.text}</div>
              <div className="text-sm text-blue-500 mt-1">体感温度: {currentWeather.feelsLike}°C</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Icon name="Droplets" size={18} color="#3b82f6" />
                <div>
                  <div className="text-xs text-blue-600">湿度</div>
                  <div className="font-bold text-blue-900">{currentWeather.humidity}%</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Wind" size={18} color="#3b82f6" />
                <div>
                  <div className="text-xs text-blue-600">风速</div>
                  <div className="font-bold text-blue-900">{currentWeather.windSpeed}km/h</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Gauge" size={18} color="#3b82f6" />
                <div>
                  <div className="text-xs text-blue-600">气压</div>
                  <div className="font-bold text-blue-900">{currentWeather.pressure}hPa</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Eye" size={18} color="#3b82f6" />
                <div>
                  <div className="text-xs text-blue-600">能见度</div>
                  <div className="font-bold text-blue-900">{currentWeather.vis}km</div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-500">更新时间: {new Date(currentWeather.obsTime).toLocaleString('zh-CN')}</div>
          </Card>
        )}
      </main>
    </AppContainer>
  )
}

export default App
