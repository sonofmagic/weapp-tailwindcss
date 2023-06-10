import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      }
    ],
    include: ['test/vite.test.ts', 'test/responsive-design.test.ts'],
    coverage: {
      enabled: true,
      reportsDirectory: 'coverage/vitest'
    },
    testTimeout: 60_000
    // ...
  }
})
