import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      }
    ],
    include: ['test/vite.test.ts'],
    coverage: {
      enabled: true,
      reportsDirectory: 'coverage/vitest'
    }
    // ...
  }
})
