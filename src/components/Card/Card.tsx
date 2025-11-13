import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated'
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ 
  variant = 'glass',
  hoverable = true,
  padding = 'md',
  className,
  children,
  ...props
}, ref) => {
  const baseStyles = 'rounded-2xl rounded-token-lg transition-all duration-300'
  const variantStyles = {
    default: 'bg-white shadow-card',
    glass: 'bg-white/40 backdrop-blur-md shadow-glass',
    elevated: 'bg-white shadow-elevated',
  } as const
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  } as const

  const hoverStyles = hoverable 
    ? 'hover:-translate-y-1 hover:shadow-card-hover cursor-pointer'
    : ''

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'
