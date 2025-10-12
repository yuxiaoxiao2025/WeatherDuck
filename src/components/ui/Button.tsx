import React from 'react';
import { cn } from '../../utils/cn';
import type { BaseComponentProps, Size, Variant } from '../../types';

export interface ButtonProps extends BaseComponentProps {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  icon,
  iconPosition = 'left',
  testId,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95',
  ];

  const variantClasses = {
    primary: [
      'bg-blue-600 hover:bg-blue-700 text-white',
      'focus:ring-blue-500',
      'dark:bg-blue-500 dark:hover:bg-blue-600',
    ],
    secondary: [
      'bg-gray-200 hover:bg-gray-300 text-gray-900',
      'focus:ring-gray-500',
      'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    ],
    success: [
      'bg-green-600 hover:bg-green-700 text-white',
      'focus:ring-green-500',
      'dark:bg-green-500 dark:hover:bg-green-600',
    ],
    warning: [
      'bg-yellow-600 hover:bg-yellow-700 text-white',
      'focus:ring-yellow-500',
      'dark:bg-yellow-500 dark:hover:bg-yellow-600',
    ],
    error: [
      'bg-red-600 hover:bg-red-700 text-white',
      'focus:ring-red-500',
      'dark:bg-red-500 dark:hover:bg-red-600',
    ],
    info: [
      'bg-cyan-600 hover:bg-cyan-700 text-white',
      'focus:ring-cyan-500',
      'dark:bg-cyan-500 dark:hover:bg-cyan-600',
    ],
  };

  const sizeClasses = {
    small: ['px-3 py-1.5 text-sm', 'gap-1'],
    medium: ['px-4 py-2 text-base', 'gap-2'],
    large: ['px-6 py-3 text-lg', 'gap-3'],
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className
  );

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <svg
          className={cn('animate-spin', size === 'small' ? 'h-3 w-3' : size === 'large' ? 'h-5 w-5' : 'h-4 w-4')}
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
      );
    }
    return icon;
  };

  const iconElement = renderIcon();

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      data-testid={testId}
      {...props}
    >
      {iconElement && iconPosition === 'left' && iconElement}
      {children}
      {iconElement && iconPosition === 'right' && iconElement}
    </button>
  );
};

export default Button;