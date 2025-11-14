import React, { useState, useEffect } from 'react'
import { AppContainer, Header } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/utils/cn'
import { WeatherService } from '@/services/weather-service'
import { CityService } from '@/services/city-service'
import { GeolocationService } from '@/services/geolocation-service'
import { IpGeolocationService } from '@/services/ip-geolocation-service'
import { validateApiConfig, DEFAULT_CITY_CONFIG } from '@/config/api-config'
import { Storage } from '@/utils/storage'
import { Logger } from '@/utils/logger'
import type { CurrentWeather, WeatherForecast, HourlyWeather } from '@/types/weather'
import { WeatherCard, ForecastList, HourlyForecast, WeatherDetail } from '@/components/Weather'
import type { CityInfo } from '@/types/city'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentCity, setCurrentCity] = useState<CityInfo | null>(null)
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null)
  const [forecast7d, setForecast7d] = useState<WeatherForecast[] | null>(null)
  const [hourly24h, setHourly24h] = useState<HourlyWeather[] | null>(null)
  const [error, setError] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<CityInfo[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchTimer = React.useRef<number | undefined>(undefined)

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
      const daily = await weatherService.getWeatherForecast(city.id)
      const hourly = await weatherService.getHourlyForecast(city.id)
      setCurrentWeather(weather)
      setForecast7d(daily)
      setHourly24h(hourly)
    } catch (err: any) {
      Logger.error('定位流程失败', err?.code, { message: err?.message })
      const fallbackCity = Storage.getJSON<CityInfo>('last_city')
      try {
        if (fallbackCity) {
          const weather = await weatherService.getCurrentWeather(fallbackCity.id)
          const daily = await weatherService.getWeatherForecast(fallbackCity.id)
          const hourly = await weatherService.getHourlyForecast(fallbackCity.id)
          setCurrentCity(fallbackCity)
          setCurrentWeather(weather)
          setForecast7d(daily)
          setHourly24h(hourly)
          setError('无法获取当前位置，已显示上海天气')
        } else {
          try {
            const ipLoc = await ipGeoService.getLocation()
            const ipCity = await cityService.getCityByCoordinates(ipLoc)
            Storage.setJSON('last_city', ipCity)
            const weather = await weatherService.getCurrentWeather(ipCity.id)
            const daily = await weatherService.getWeatherForecast(ipCity.id)
            const hourly = await weatherService.getHourlyForecast(ipCity.id)
            setCurrentCity(ipCity)
            setCurrentWeather(weather)
            setForecast7d(daily)
            setHourly24h(hourly)
            setError('定位超时，已根据IP定位显示天气')
            return
          } catch {}
          const cities = await cityService.searchCities({ location: '上海', range: 'cn' })
          if (cities.length > 0) {
            const city = cities[0]
            setCurrentCity(city)
            Storage.setJSON('last_city', city)
            const weather = await weatherService.getCurrentWeather(city.id)
            const daily = await weatherService.getWeatherForecast(city.id)
            const hourly = await weatherService.getHourlyForecast(city.id)
            setCurrentWeather(weather)
            setForecast7d(daily)
            setHourly24h(hourly)
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
    if (!searchQuery.trim()) return
    await runSearch(searchQuery)
  }

  const runSearch = async (q: string) => {
    if (!q.trim()) {
      setSuggestions([])
      setDropdownOpen(false)
      return
    }
    setSearchLoading(true)
    try {
      const cities = await cityService.searchCities({ location: q.trim(), range: 'cn', number: 10, lang: 'zh' })
      setSuggestions(cities)
      setDropdownOpen(true)
      setActiveIndex(-1)
    } catch (err: any) {
      setSuggestions([])
      setDropdownOpen(true)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    if (searchTimer.current) window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => {
      runSearch(q)
    }, 400)
  }

  const handleSelectCity = async (city: CityInfo) => {
    setDropdownOpen(false)
    setSearchQuery(city.name)
    setIsLoading(true)
    setError('')
    try {
      setCurrentCity(city)
      Storage.setJSON('last_city', city)
      const weather = await weatherService.getCurrentWeather(city.id)
      const daily = await weatherService.getWeatherForecast(city.id)
      const hourly = await weatherService.getHourlyForecast(city.id)
      setCurrentWeather(weather)
      setForecast7d(daily)
      setHourly24h(hourly)
    } catch (err: any) {
      setError(err.message || '搜索城市失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelectCity(suggestions[activeIndex])
      } else if (searchQuery.trim()) {
        runSearch(searchQuery)
      }
    } else if (e.key === 'Escape') {
      setDropdownOpen(false)
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
      const daily = await weatherService.getWeatherForecast(currentCity.id, true)
      const hourly = await weatherService.getHourlyForecast(currentCity.id, true)
      setCurrentWeather(weather)
      setForecast7d(daily)
      setHourly24h(hourly)
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
        <Card variant="glass" className="relative z-50">
          <h3 className="text-lg font-bold text-blue-900 mb-3">API功能测试</h3>
          <div className="space-y-2">
            <Button variant="primary" className="w-full" leftIcon={<Icon name="MapPin" size={18} />} onClick={handleGetLocationWeather} isLoading={isLoading}>获取当前位置天气</Button>
            <div className={cn('relative', dropdownOpen ? 'z-50' : '')}>
              <div className="inline-flex items-center w-full rounded-lg rounded-token-lg bg-white/20 backdrop-blur px-3 py-2">
                <Icon name="Search" size={18} className="mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => suggestions.length > 0 && setDropdownOpen(true)}
                  className="flex-1 bg-transparent outline-none text-blue-900 placeholder-blue-600 text-base"
                  placeholder="输入城市名称进行搜索"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="清除"
                    onClick={() => { setSearchQuery(''); setSuggestions([]); setDropdownOpen(false) }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Icon name="X" size={18} />
                  </button>
                )}
              </div>
              {dropdownOpen && (
                <div className="absolute z-50 mt-2 w-full">
                  <Card variant="glass" className="max-h-64 overflow-y-auto">
                    {searchLoading && (
                      <div className="px-3 py-2 text-blue-600">搜索中...</div>
                    )}
                    {!searchLoading && suggestions.length === 0 && (
                      <div className="px-3 py-2 text-blue-600">未找到城市</div>
                    )}
                    {!searchLoading && suggestions.map((c, idx) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); handleSelectCity(c) }}
                        className={cn(
                          'flex w-full items-center justify-between px-3 py-2 rounded-lg transition-all',
                          idx === activeIndex ? 'bg-white/40' : 'hover:bg-white/30'
                        )}
                      >
                        <span className="text-blue-900 font-medium">{c.name}</span>
                        <span className="text-blue-600 text-sm">{c.adm1} · {c.country}</span>
                      </button>
                    ))}
                  </Card>
                </div>
              )}
            </div>
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
          <WeatherCard weather={currentWeather} cityName={currentCity?.name} />
        )}
        {forecast7d && (
          <ForecastList forecasts={forecast7d} />
        )}
        {hourly24h && (
          <HourlyForecast hourlyData={hourly24h} />
        )}
        {currentWeather && (
          <WeatherDetail weather={currentWeather} />
        )}
      </main>
    </AppContainer>
  )
}

export default App
