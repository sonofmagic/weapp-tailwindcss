import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.{test,spec}.ts'],
    alias: [
      { find: 'weapp-tailwindcss/rspack', replacement: path.resolve(__dirname, './test/stubs/rspack.ts') },
    ],
  },
})
