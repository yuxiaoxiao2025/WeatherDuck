import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import type { InputProps } from '../../types';

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  required = false,
  helpText,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  autoComplete,
  className,
  testId,
  ...props
}, ref) => {
  const inputId = React.useId();

  const baseClasses = [
    'block w-full rounded-lg border px-3 py-2',
    'text-sm placeholder-gray-500',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ];

  const stateClasses = error
    ? [
        'border-red-300 text-red-900 placeholder-red-300',
        'focus:border-red-500 focus:ring-red-500',
        'dark:border-red-600 dark:text-red-100 dark:placeholder-red-400',
      ]
    : [
        'border-gray-300 text-gray-900',
        'focus:border-blue-500 focus:ring-blue-500',
        'dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400',
        'dark:focus:border-blue-400 dark:focus:ring-blue-400',
      ];

  const inputClasses = cn(baseClasses, stateClasses, className);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium',
            error ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={inputClasses}
        data-testid={testId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
        }
        {...props}
      />
      
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p
          id={`${inputId}-help`}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;