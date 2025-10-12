import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, variant = 'default', padding = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card text-card-foreground',
          {
            'border-border': variant === 'default',
            'border-2 border-border': variant === 'outlined',
            'shadow-lg border-border': variant === 'elevated',
            'p-0': padding === 'none',
            'p-3': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;