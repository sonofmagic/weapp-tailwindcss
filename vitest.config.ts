import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import YAML from 'yaml'

const ROOT_DIR = path.dirname(fileURLToPath(new URL(import.meta.url)))
const WORKSPACE_FILE = path.resolve(ROOT_DIR, 'pnpm-workspace.yaml')
const CONFIG_FILENAMES = [
  'vitest.config.ts',
  'vitest.config.mts',
  'vitest.config.cts',
  'vitest.config.js',
  'vitest.config.cjs',
  'vitest.config.mjs',
] as const

function extractBaseDirFromGlob(pattern: string): string | null {
  if (!pattern) {
    return null
  }

  const normalized = pattern
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
  const globIndex = normalized.search(/[*?[{]/)
  const base = globIndex === -1
    ? normalized
    : normalized.slice(0, globIndex)

  const cleaned = base.replace(/\/+$/, '')
  return cleaned || null
}

function loadProjectRootsFromWorkspace(): string[] {
  if (!fs.existsSync(WORKSPACE_FILE)) {
    return []
  }

  try {
    const workspaceContent = fs.readFileSync(WORKSPACE_FILE, 'utf8')
    const workspace = YAML.parse(workspaceContent) ?? {}
    const packages: unknown[] = Array.isArray(workspace.packages) ? workspace.packages : []
    const roots = packages
      .map(entry => typeof entry === 'string' ? entry.trim() : '')
      .filter(entry => entry && !entry.startsWith('!'))
      .map(extractBaseDirFromGlob)
      .filter((entry): entry is string => Boolean(entry))

    return roots.length ? Array.from(new Set(roots)) : []
  }
  catch (error) {
    console.warn('[vitest] Failed to parse pnpm-workspace.yaml, no project roots will be used.', error)
    return []
  }
}

const PROJECT_ROOTS = loadProjectRootsFromWorkspace()

if (!PROJECT_ROOTS.length) {
  console.warn('[vitest] No project roots detected. Check pnpm-workspace.yaml to define workspace packages.')
}

function findConfig(basePath: string): string | null {
  for (const filename of CONFIG_FILENAMES) {
    const candidate = path.join(basePath, filename)
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }
  return null
}

function resolveProjects(): string[] {
  const projects: string[] = []

  for (const folder of PROJECT_ROOTS) {
    const rootPath = path.resolve(ROOT_DIR, folder)
    if (!fs.existsSync(rootPath)) {
      continue
    }

    const rootConfig = findConfig(rootPath)
    if (rootConfig) {
      projects.push(path.relative(ROOT_DIR, rootConfig))
    }

    const entries = fs.readdirSync(rootPath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      const projectDir = path.join(rootPath, entry.name)
      const configPath = findConfig(projectDir)
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
