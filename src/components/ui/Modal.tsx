import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import type { ModalProps } from '../../types';

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  className,
  testId,
}) => {
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    fullscreen: 'max-w-full h-full m-0 rounded-none',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      data-testid={testId}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl',
          'transform transition-all duration-200',
          'max-h-[90vh] overflow-hidden',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className={cn(
                'p-1 rounded-lg text-gray-400 hover:text-gray-600',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
              aria-label="关闭"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={cn(
          'overflow-y-auto',
          title ? 'p-6' : 'p-6',
          size === 'fullscreen' ? 'h-full' : 'max-h-[calc(90vh-8rem)]'
        )}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;