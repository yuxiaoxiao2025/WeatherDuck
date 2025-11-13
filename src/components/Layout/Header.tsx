import React from 'react'
import { cn } from '@/utils/cn'
import { Icon } from '@/components/Icon'

export interface HeaderProps {
  title?: string
  subtitle?: string
  onRefresh?: () => void
  onSettings?: () => void
  className?: string
}

export const Header: React.FC<HeaderProps> = ({
  title = '天气鸭',
  subtitle = '智能天气助手',
  onRefresh,
  onSettings,
  className,
}) => {
  return (
    <header 
      className={cn(
        'bg-gradient-to-r from-blue-500 to-blue-400',
        'py-4 px-6 flex justify-between items-center',
        'h-14 flex-shrink-0',
        className
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl">🦆</div>
        <div>
          <h1 className="text-white text-xl font-bold tracking-wider">
            {title}
          </h1>
          <p className="text-blue-100 text-xs">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition"
            aria-label="刷新天气"
          >
            <Icon name="RefreshCw" size={18} color="white" />
          </button>
        )}
        
        {onSettings && (
          <button
            type="button"
            onClick={onSettings}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition"
            aria-label="打开设置"
          >
            <Icon name="Settings" size={18} color="white" />
          </button>
        )}
      </div>
    </header>
  )
}

