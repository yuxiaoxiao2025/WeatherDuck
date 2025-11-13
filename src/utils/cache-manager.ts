export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>>
  private defaultDuration: number

  constructor(defaultDuration: number = 1800000) {
    this.cache = new Map()
    this.defaultDuration = defaultDuration
  }

  set<T>(key: string, data: T, duration?: number): void {
    const timestamp = Date.now()
    const ttl = duration ?? this.defaultDuration
    this.cache.set(key, { data, timestamp, expiresAt: timestamp + ttl })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return entry.data as T
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  clearExpired(): number {
    const now = Date.now()
    let count = 0
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }

  get size(): number {
    return this.cache.size
  }
}
