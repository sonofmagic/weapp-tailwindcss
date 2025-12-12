import path from 'node:path'
import { defineProject } from 'vitest/config'

const alias = [
  {
    find: '@',
    replacement: path.resolve(__dirname, './src'),
  },
]

export default defineProject({
  test: {
    alias,
    globals: true,
    testTimeout: 60_000,
    benchmark: {

    },
  },
})
