import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['scripts/**/*.test.{mjs,ts}', 'src/**/*.test.ts'],
    environment: 'node',
  },
})
