export const SPACING = {
  XS: '4px',
  SM: '8px',
  MD: '16px',
  LG: '24px',
  XL: '32px',
  XXL: '48px',
} as const

export const BORDER_RADIUS = {
  SM: '8px',
  MD: '12px',
  LG: '16px',
  XL: '20px',
  XXL: '24px',
  FULL: '9999px',
} as const

export const SHADOWS = {
  GLASS: '0 8px 32px 0 rgba(6, 132, 255, 0.1)',
  CARD: '0 4px 12px rgba(6, 132, 255, 0.08)',
  CARD_HOVER: '0 8px 22px rgba(6, 132, 255, 0.18)',
  ELEVATED: '0 20px 40px rgba(0, 0, 0, 0.2)',
} as const

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const

export const EASING = {
  EASE_OUT: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  SPRING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const

