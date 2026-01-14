import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { findNearestPackageRoot } from '@/context/workspace'

const GENERIC_RELATIVE_SPECIFIERS = ['.', '..']
const DEFAULT_TAILWIND_CONFIG_SPECIFIERS = [
  'stubs/config.full.js',
  'defaultConfig.js',
]
const TAILWIND_CONFIG_FILES = [
  'tailwind.config.js',
  'tailwind.config.cjs',
  'tailwind.config.mjs',
  'tailwind.config.ts',
  'tailwind.config.cts',
  'tailwind.config.mts',
]

function isPathSpecifier(specifier: string) {
  if (!specifier) {
    return false
  }
  if (specifier.startsWith('file://')) {
    return true
  }
  if (path.isAbsolute(specifier)) {
    return true
  }
  return GENERIC_RELATIVE_SPECIFIERS.some(prefix => specifier.startsWith(`${prefix}/`) || specifier.startsWith(`${prefix}\\`))
}

export function resolveModuleFromPaths(specifier: string | undefined, paths: string[]) {
  if (!specifier || isPathSpecifier(specifier) || paths.length === 0) {
    return undefined
  }
  try {
    const req = createRequire(import.meta.url)
    return req.resolve(specifier, { paths })
  }
  catch {
    return undefined
  }
}

export function resolveTailwindConfigFallback(
  packageName: string | undefined,
  paths: string[],
) {
  if (!packageName) {
    return undefined
  }
  for (const suffix of DEFAULT_TAILWIND_CONFIG_SPECIFIERS) {
    const candidate = `${packageName}/${suffix}`
    const resolved = resolveModuleFromPaths(candidate, paths)
    if (resolved) {
      return resolved
    }
  }
  return undefined
}

function appendNodeModules(paths: Set<string>, dir?: string) {
  if (!dir) {
    return
  }
  const nodeModulesDir = path.join(dir, 'node_modules')
  if (existsSync(nodeModulesDir)) {
    paths.add(nodeModulesDir)
  }
}

export function findTailwindConfig(searchRoots: Iterable<string>): string | undefined {
  for (const root of searchRoots) {
    for (const file of TAILWIND_CONFIG_FILES) {
      const candidate = path.resolve(root, file)
      if (existsSync(candidate)) {
        return candidate
      }
    }
  }
  return undefined
}

export function createDefaultResolvePaths(basedir?: string) {
  const paths = new Set<string>()
  let fallbackCandidates: string[] = []
  if (basedir) {
    const resolvedBase = path.resolve(basedir)
    appendNodeModules(paths, resolvedBase)
    fallbackCandidates.push(resolvedBase)
    const packageRoot = findNearestPackageRoot(resolvedBase)
    if (packageRoot) {
      appendNodeModules(paths, packageRoot)
      fallbackCandidates.push(packageRoot)
    }
  }
  const cwd = process.cwd()
  appendNodeModules(paths, cwd)
  try {
    const modulePath = fileURLToPath(import.meta.url)
    const candidate = existsSync(modulePath) && !path.extname(modulePath)
      ? modulePath
      : path.dirname(modulePath)
    paths.add(candidate)
  }
  catch {
    // Fallback to the raw URL when fileURLToPath is unavailable.
    paths.add(import.meta.url)
  }
  if (paths.size === 0) {
    fallbackCandidates = fallbackCandidates.filter(Boolean)
    if (fallbackCandidates.length === 0) {
      fallbackCandidates.push(cwd)
    }
    for (const candidate of fallbackCandidates) {
      paths.add(candidate)
    }
  }
  return [...paths]
}
