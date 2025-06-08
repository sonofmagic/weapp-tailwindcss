import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/*',
      'plugins/*',
    ],
    coverage: {
      enabled: true,
      skipFull: true,
      all: false,
    },
  },
})
