import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Electron APIs for testing
Object.defineProperty(window, 'electronAPI', {
  value: {
    // Mock electron APIs here if needed
    getVersion: () => Promise.resolve('1.0.0'),
    platform: 'test',
  },
  writable: true,
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null
  rootMargin: string = ''
  thresholds: ReadonlyArray<number> = []
  
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});