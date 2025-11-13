type LogLevel = 'info' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  code?: string
  timestamp: number
  context?: Record<string, any>
}

const KEY = 'weather_duck_logs'

function read(): LogEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(entries: LogEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(-200)))
  } catch {}
}

export const Logger = {
  log(level: LogLevel, message: string, code?: string, context?: Record<string, any>) {
    const entry: LogEntry = { level, message, code, timestamp: Date.now(), context: { ua: navigator.userAgent, platform: navigator.platform, screen: { w: screen.width, h: screen.height }, ...context } }
    const list = read()
    list.push(entry)
    write(list)
    if (level === 'error') console.error(message, { code, context: entry.context })
    else console.log(message, { code, context: entry.context })
  },
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, undefined, context)
  },
  error(message: string, code?: string, context?: Record<string, any>) {
    this.log('error', message, code, context)
  },
  getAll(): LogEntry[] {
    return read()
  },
}
