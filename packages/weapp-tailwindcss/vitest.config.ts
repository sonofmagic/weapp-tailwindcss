import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      },
      {
        find: '#test',
        replacement: path.resolve(__dirname, './test')
      }
    ],
    // ,
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)', process.env.TARGET === '1' ? undefined : 'plugins/**/test/**/*.{test,spec}.?(c|m)[jt]s?(x)'].filter(Boolean) as string[],
    coverage: {
      enabled: true,
      all: false

      // reportsDirectory: 'coverage/vitest'
    },
    testTimeout: 60_000,
    globals: true
    // ...
  }
})
