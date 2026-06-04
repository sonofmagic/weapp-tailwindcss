import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^weapp-tailwindcss\/generator$/,
        replacement: path.resolve(__dirname, '../packages/weapp-tailwindcss/src/generator/index.ts'),
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, '../packages/weapp-tailwindcss/src'),
      },
      {
        find: '@weapp-tailwindcss/reset',
        replacement: path.resolve(__dirname, '../packages/reset/src/index.ts'),
      },
      {
        find: /^@weapp-tailwindcss\/postcss$/,
        replacement: path.resolve(__dirname, '../packages/postcss/src/index.ts'),
      },
    ],
  },
  test: {
    include: [path.resolve(__dirname, './*.test.ts')],
    reporters: ['default', path.resolve(__dirname, './progress-reporter.ts')],
    testTimeout: 36_000_000,
    globals: true,
    maxConcurrency: 1,
    maxWorkers: 1,
  },
})
