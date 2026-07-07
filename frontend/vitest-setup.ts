import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IntersectionObserver for framer-motion
class IntersectionObserverMock {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
  takeRecords = vi.fn()
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
