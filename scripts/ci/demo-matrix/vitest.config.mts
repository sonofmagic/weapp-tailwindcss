import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['scripts/ci/demo-matrix/*.test.mjs'],
    update: 'none',
  },
})
