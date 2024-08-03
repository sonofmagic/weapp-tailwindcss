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
    testTimeout: 60_000,
    setupFiles: ['./vitest.setup.ts'],
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    // https://vitest.dev/config/#forcereruntriggers
    // @ts-ignore
    forceRerunTriggers: ['**/vitest.config.*/**', '**/vite.config.*/**'],
  },
})
