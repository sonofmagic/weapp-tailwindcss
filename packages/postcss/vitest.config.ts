import path from 'node:path'
import { defineProject } from 'vitest/config'

const alias = [
  {
    find: '@',
    replacement: path.resolve(__dirname, './src'),
  },
  {
    find: /^tailwindcss-config$/,
    replacement: path.resolve(__dirname, '../tailwindcss-config/src/index.ts'),
  },
  {
    find: /^@weapp-tailwindcss\/shared$/,
    replacement: path.resolve(__dirname, '../shared/src/index.ts'),
  },
  {
    find: /^@weapp-tailwindcss\/postcss-calc$/,
    replacement: path.resolve(__dirname, '../postcss-calc/src/index.ts'),
  },
]

export default defineProject({
  test: {
    alias,
    globals: true,
    testTimeout: 60_000,
    coverage: {
      exclude: [
        '**/dist/**',
        '**/test/**',
        '**/tests/**',
        '**/*.bench.*',
        '**/packages/postcss-calc/**',
        '../postcss-calc/**',
      ],
      thresholds: {
        lines: 95,
        statements: 95,
        functions: 95,
      },
    },
    benchmark: {

    },
  },
})
