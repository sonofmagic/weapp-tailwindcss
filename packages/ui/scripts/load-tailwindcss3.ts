import { readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const requireFromThisModule = createRequire(import.meta.url)

export async function loadTailwindcss3(baseDir: string) {
  const pnpmDir = path.resolve(baseDir, '..', '..', 'node_modules', '.pnpm')
  const entries = await readdir(pnpmDir)
  const match = entries.find(entry => entry.startsWith('tailwindcss@3'))

  if (!match) {
    throw new Error('Tailwind CSS v3 package was not found in node_modules/.pnpm')
  }

  const modulePath = path.resolve(pnpmDir, match, 'node_modules', 'tailwindcss')
  return requireFromThisModule(modulePath)
}
