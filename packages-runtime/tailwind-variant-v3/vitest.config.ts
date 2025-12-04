import { readdirSync } from 'node:fs'
import path from 'node:path'
import { defineProject } from 'vitest/config'

function resolveTailwindMergeModule() {
  const pnpmDir = path.resolve(__dirname, '../merge/node_modules/.pnpm')

  try {
    const entry = readdirSync(pnpmDir).find(dir => dir.startsWith('tailwind-merge@'))

    if (entry) {
      return path.resolve(pnpmDir, entry, 'node_modules/tailwind-merge')
    }
  }
  catch {
    // fall through to default path
  }

  return 'tailwind-merge'
}

const tailwindMergeModule = resolveTailwindMergeModule()

export default defineProject({
  test: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: 'tailwind-merge',
        replacement: tailwindMergeModule,
      },
    ],
    globals: true,
    testTimeout: 60_000,
  },
})
