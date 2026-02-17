import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Keep glob in POSIX style; absolute Windows paths with backslashes can make Vitest glob matching miss files.
    include: ['e2e/watch/**/*.test.ts'],
    testTimeout: 36_000_000,
    globals: true,
    maxConcurrency: 1,
    maxWorkers: 1,
  },
})
