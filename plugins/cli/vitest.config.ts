import path from 'node:path'
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
    globals: true,
    testTimeout: 30_000,
    setupFiles: ['./vitest.setup.ts'],
    // coverage: {
    //   enabled: true,
    //   all: false,
    // },
  },
})
