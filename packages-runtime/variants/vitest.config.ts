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
        find: '@weapp-tailwindcss/runtime',
        replacement: path.resolve(__dirname, '../runtime/src'),
      },
      {
        find: '@weapp-tailwindcss/merge',
        replacement: path.resolve(__dirname, '../merge/src'),
      },
    ],
    globals: true,
    testTimeout: 60_000,
  },
})
