import path from 'node:path'
import { defineConfig } from 'vitest/config'

const workspaceAliases = [
  {
    find: /^@weapp-tailwindcss\/shared$/,
    replacement: path.resolve(__dirname, '../packages/shared/src/index.ts'),
  },
  {
    find: /^@weapp-tailwindcss\/shared\/extractors$/,
    replacement: path.resolve(__dirname, '../packages/shared/src/extractors/index.ts'),
  },
  {
    find: /^@weapp-tailwindcss\/shared\/node$/,
    replacement: path.resolve(__dirname, '../packages/shared/src/node.ts'),
  },
  {
    find: /^@weapp-tailwindcss\/logger$/,
    replacement: path.resolve(__dirname, '../packages/logger/src/index.ts'),
  },
  {
    find: /^tailwindcss-config$/,
    replacement: path.resolve(__dirname, '../packages/tailwindcss-config/src/index.ts'),
  },
  {
    find: /^@weapp-tailwindcss\/postcss$/,
    replacement: path.resolve(__dirname, '../packages/postcss/src/index.ts'),
  },
  {
    find: /^@weapp-tailwindcss\/postcss\/types$/,
    replacement: path.resolve(__dirname, '../packages/postcss/src/types.ts'),
  },
  {
    find: /^@weapp-tailwindcss\/postcss\/html-transform$/,
    replacement: path.resolve(__dirname, '../packages/postcss/src/html-transform.ts'),
  },
  {
    find: /^@weapp-tailwindcss\/postcss\/css-macro\/postcss$/,
    replacement: path.resolve(__dirname, '../packages/postcss/src/css-macro/postcss.ts'),
  },
]

export default defineConfig({
  resolve: {
    alias: [
      ...workspaceAliases,
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
