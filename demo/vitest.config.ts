import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const demoRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    root: demoRoot,
    include: [
      '__tests__/**/*.test.ts',
    ],
    environment: 'node',
  },
})
