import React from 'react'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/utils/cn'

export type IconName = keyof typeof LucideIcons

export interface IconProps {
  name: IconName
  size?: number | string
  color?: string
  className?: string
  strokeWidth?: number
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  className,
  strokeWidth = 2,
}) => {
  const IconComponent = LucideIcons[name] as React.ComponentType<Record<string, unknown>>
  if (!IconComponent) return null
  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={cn('inline-block', className)}
      aria-hidden="true"
    />
  )
}
