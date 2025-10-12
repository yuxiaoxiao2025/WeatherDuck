import React from 'react';
import { cn } from '../../utils/cn';
import type { LoadingSpinnerProps } from '../../types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  className,
  testId,
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  const colorClass = color ? `text-${color}` : 'text-blue-600 dark:text-blue-400';

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      data-testid={testId}
    >
      <svg
        className={cn(
          'animate-spin',
          sizeClasses[size],
          colorClass
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export default LoadingSpinner;