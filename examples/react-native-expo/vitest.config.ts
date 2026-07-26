import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    alias: [
      { find: '@weapp-tailwindcss/react-native/compiler', replacement: path.resolve(__dirname, '../../packages/react-native/src/compiler.ts') },
    ],
  },
})
