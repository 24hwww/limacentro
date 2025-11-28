import '@testing-library/jest-dom'

// Ensure global fetch is available in Jest tests (Node 18+ provides globalThis.fetch)
if (typeof global.fetch === 'undefined' && typeof globalThis.fetch === 'function') {
  // @ts-ignore - Jest setup file is plain JS, types are not enforced here
  global.fetch = globalThis.fetch;
}
