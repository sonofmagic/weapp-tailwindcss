import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // , 'plugins/**/test/**/*.{test,spec}.?(c|m)[jt]s?(x)'
    // include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      enabled: true,
      all: false
    },
    testTimeout: 60_000,
    globals: true
    // ...
  }
})
