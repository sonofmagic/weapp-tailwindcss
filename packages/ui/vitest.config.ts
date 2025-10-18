import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    testTimeout: 60_000,
    environment: 'node',
  },
  resolve: {
    alias: {
      'tailwind-merge': resolve(__dirname, '../merge/node_modules/tailwind-merge'),
    },
  },
})
