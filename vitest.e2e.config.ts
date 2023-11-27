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
    include: ['e2e/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    testTimeout: 36_000_000,
    globals: true
    // ...
  }
})
