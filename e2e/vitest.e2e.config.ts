import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [path.resolve(__dirname, './*.test.ts')],
    testTimeout: 36_000_000,
    globals: true,
    poolOptions: {
      forks: {
        maxForks: 1,
        minForks: 1,
      },
      threads: {
        maxThreads: 1,
        minThreads: 1,
      },
    },
    // ...
  },
})
