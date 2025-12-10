import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: '#test',
        replacement: path.resolve(__dirname, './test'),
      },
    ],
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    benchmark: {
      include: ['test/**/*.bench.ts'],
      outputJson: 'benchmark/bench-report.json',
    },
    coverage: {
      enabled: true,
      // reportsDirectory: 'coverage/vitest'
    },
    testTimeout: 60_000,
    globals: true,
    forceRerunTriggers: ['**\/{vitest,vite}.config.*\/**'],
    // ...
  },
  server: {
    watch: {
      ignored: ['**\/package.json/**'],
    },
  },
})
