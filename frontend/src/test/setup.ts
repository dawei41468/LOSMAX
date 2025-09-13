import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import '@testing-library/jest-dom'
import { server } from './server.ts'

// Establish API mocking before all tests.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers()
})

// Clean up after the tests are finished.
afterAll(() => {
  server.close()
})

// Polyfill matchMedia for components that may rely on it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
})
