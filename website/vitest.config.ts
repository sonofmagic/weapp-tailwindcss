import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['scripts/**/*.test.mjs', 'src/**/*.test.ts'],
    environment: 'node',
  },
})
