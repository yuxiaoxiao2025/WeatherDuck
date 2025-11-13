import React from 'react'
import { cn } from '@/utils/cn'

export interface AppContainerProps {
  children: React.ReactNode
  className?: string
}

export const AppContainer: React.FC<AppContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('app-container', className)}>
      {children}
    </div>
  )
}

