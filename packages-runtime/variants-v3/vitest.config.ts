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
        find: '@weapp-tailwindcss/merge-v3',
        replacement: path.resolve(__dirname, '../merge-v3/src'),
      },
      {
        find: 'tailwind-variant-v3',
        replacement: path.resolve(__dirname, '../tailwind-variant-v3/src'),
      },
    ],
    globals: true,
    testTimeout: 60_000,
  },
})
