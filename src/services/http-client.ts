import { API_REQUEST_CONFIG } from '@/config/api-config'
import { ApiError, NetworkError, TimeoutError, ERROR_CODES } from '@/utils/errors'

export interface HttpRequestOptions {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
}

export class HttpClient {
  private baseURL: string
  private defaultTimeout: number
  private defaultRetries: number

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.defaultTimeout = API_REQUEST_CONFIG.TIMEOUT
    this.defaultRetries = API_REQUEST_CONFIG.RETRY_TIMES
  }

  async get<T>(endpoint: string, params?: Record<string, string | number>, options?: HttpRequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, params)
    return this.fetchWithRetry<T>(url, { method: 'GET', headers: { Accept: 'application/json', ...options?.headers } }, options)
  }

  async post<T>(endpoint: string, data?: any, options?: HttpRequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint)
    return this.fetchWithRetry<T>(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...options?.headers }, body: JSON.stringify(data) }, options)
  }

  private async fetchWithRetry<T>(url: string, init: RequestInit, options?: HttpRequestOptions): Promise<T> {
    const maxRetries = options?.retries ?? this.defaultRetries
    const timeout = options?.timeout ?? this.defaultTimeout
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, init, timeout)
        if (response.status === 429 || response.status >= 500) {
          throw new ApiError('服务繁忙或达到限流', ERROR_CODES.RATE_LIMITED, response.status)
        }
        return await this.handleResponse<T>(response)
      } catch (error) {
        lastError = error as Error
        const isLast = attempt >= maxRetries - 1
        if (isLast) break
        const delay = this.calculateBackoffDelay(attempt)
        await this.sleep(delay)
      }
    }

    throw new ApiError(`请求失败，已重试 ${maxRetries} 次`, ERROR_CODES.API_REQUEST_FAILED, undefined, url)
  }

  private async fetchWithTimeout(url: string, init: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    try {
      const response = await fetch(url, { ...init, signal: controller.signal })
      return response
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new TimeoutError(`请求超时（${timeout}ms）`)
      }
      throw new NetworkError('网络请求失败', error)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new ApiError(`HTTP错误: ${response.status} ${response.statusText}`, ERROR_CODES.API_REQUEST_FAILED, response.status)
    }
    try {
      const data = await response.json()
      return data as T
    } catch {
      throw new ApiError('响应数据解析失败', ERROR_CODES.API_RESPONSE_INVALID)
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(endpoint, this.baseURL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
    }
    return url.toString()
  }

  private calculateBackoffDelay(attempt: number): number {
    const base = 1000
    const exp = base * Math.pow(2, attempt)
    const jitter = Math.floor(Math.random() * 250)
    return Math.min(exp + jitter, 60000)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
