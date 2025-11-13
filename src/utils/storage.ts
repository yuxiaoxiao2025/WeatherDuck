export const Storage = {
  setJSON(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  getJSON<T>(key: string, fallback?: T): T | undefined {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },
}
