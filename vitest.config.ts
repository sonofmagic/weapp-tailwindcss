import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/*',
      'packages-runtime/*',
      'plugins/*',
    ],
    coverage: {
      enabled: true,
      skipFull: true,
    },
  },
})
