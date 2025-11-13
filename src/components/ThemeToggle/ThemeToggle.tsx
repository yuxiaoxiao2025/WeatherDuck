import React, { useEffect, useState } from 'react'

export interface ThemeToggleProps {
  initial?: 'light' | 'dark' | 'system'
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ initial = 'system' }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(initial)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = (t: 'light' | 'dark' | 'system') => {
      const isDark = t === 'dark' || (t === 'system' && mql.matches)
      document.documentElement.classList.toggle('dark', isDark)
      localStorage.setItem('theme', t)
    }
    apply(theme)
  }, [theme])

  return (
    <div className="flex items-center gap-2">
      <button type="button" className="px-3 py-1 rounded-token-lg bg-white/20 text-white" onClick={() => setTheme('light')}>浅色</button>
      <button type="button" className="px-3 py-1 rounded-token-lg bg-white/20 text-white" onClick={() => setTheme('dark')}>深色</button>
      <button type="button" className="px-3 py-1 rounded-token-lg bg-white/20 text-white" onClick={() => setTheme('system')}>系统</button>
    </div>
  )
}

