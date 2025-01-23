import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    workspace: [
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
