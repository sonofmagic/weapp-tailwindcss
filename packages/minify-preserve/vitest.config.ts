import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./test/setup/esbuild-cleanup.ts'],
    globals: true,
    include: ['test/**/*.test.ts'],
    environment: 'node',
    testTimeout: 60_000,
  },
})
