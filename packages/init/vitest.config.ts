import path from 'node:path'
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: 'npm-registry-fetch',
        replacement: path.resolve(__dirname, './test/mocks/npm-registry-fetch.ts'),
      },
    ],
    globals: true,
    testTimeout: 60_000,
  },
})
