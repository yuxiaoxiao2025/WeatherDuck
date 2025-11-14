import '@testing-library/jest-dom'
import { vi } from 'vitest'

if (!window.matchMedia) {
  // JSDOM polyfill for matchMedia used by ThemeToggle
  // Minimal implementation sufficient for tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}
