import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    environment: 'node',
    testTimeout: 60_000,
  },
})
