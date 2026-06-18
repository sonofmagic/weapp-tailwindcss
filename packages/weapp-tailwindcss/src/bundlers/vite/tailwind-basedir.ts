import { existsSync } from 'node:fs'
import path from 'node:path'
import { findNearestPackageRoot } from '@/context/workspace'
import { findTailwindConfig } from '@/tailwindcss/runtime-resolve'

const PACKAGE_JSON_FILE = 'package.json'

export function resolveImplicitTailwindcssBasedirFromViteRoot(root: string) {
  const resolvedRoot = path.resolve(root)
  if (!existsSync(resolvedRoot)) {
    return resolvedRoot
  }
  const searchRoots: string[] = []
  let current = resolvedRoot

  while (true) {
    searchRoots.push(current)
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }

  const tailwindConfigPath = findTailwindConfig(searchRoots)
  if (tailwindConfigPath) {
    return path.dirname(tailwindConfigPath)
  }

  const packageRoot = findNearestPackageRoot(resolvedRoot)
  if (packageRoot && existsSync(path.join(packageRoot, PACKAGE_JSON_FILE))) {
    return packageRoot
  }

  return resolvedRoot
}
