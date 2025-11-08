import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/*',
      'packages-runtime/*',
    ],
    coverage: {
      enabled: true,
      skipFull: true,
    },
  },
})
