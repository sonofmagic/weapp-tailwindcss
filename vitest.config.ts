import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const ROOT_DIR = path.dirname(fileURLToPath(new URL(import.meta.url)))
const PROJECT_ROOTS = [
  'packages',
  'packages-runtime/*',
  // 'apps',
]
const CONFIG_CANDIDATES = [
  'vitest.config.ts',
  'vitest.config.mts',
  'vitest.config.js',
  'vitest.config.cjs',
  'vitest.workspace.ts',
  'vitest.workspace.mts',
]

function resolveProjects(): string[] {
  const projects: string[] = []

  for (const folder of PROJECT_ROOTS) {
    const rootPath = path.resolve(ROOT_DIR, folder)
    if (!fs.existsSync(rootPath)) {
      continue
    }

    const entries = fs.readdirSync(rootPath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      const projectDir = path.join(rootPath, entry.name)
      const configPath = CONFIG_CANDIDATES
        .map(candidate => path.join(projectDir, candidate))
        .find(fs.existsSync)

      if (configPath) {
        projects.push(path.relative(ROOT_DIR, configPath))
      }
    }
  }

  return projects
}

const projects = resolveProjects()

export default defineConfig(() => {
  return {
    test: {
      projects,
      coverage: {
        enabled: true,
        skipFull: true,
      },
      forceRerunTriggers: [
        '**/{vitest,vite}.config.*/**',
      ],
    },
  }
})
