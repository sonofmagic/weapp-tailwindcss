import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)

export function resolvePackageDir(name: string): string {
  const pkgPath = require.resolve(`${name}/package.json`)
  return path.dirname(pkgPath)
}
