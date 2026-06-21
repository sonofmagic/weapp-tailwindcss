import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

export type SupportedTailwindcssMajorVersion = 4

export const DEFAULT_TAILWINDCSS_GENERATOR_MAJOR_VERSION: SupportedTailwindcssMajorVersion = 4

export function normalizeSupportedTailwindcssMajorVersion(
  version: number | undefined,
): SupportedTailwindcssMajorVersion | undefined {
  return version === 4 ? version : undefined
}

interface PackageJsonLike {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

function readPackageJson(packageJsonPath: string): PackageJsonLike | undefined {
  try {
    return JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJsonLike
  }
  catch {
    return undefined
  }
}

function findPackageJsonDeclaringPackage(packageName: string, base: string) {
  let current = path.resolve(base)
  while (true) {
    const pkgPath = path.join(current, 'package.json')
    if (existsSync(pkgPath)) {
      const pkg = readPackageJson(pkgPath)
      if (readDeclaredPackageVersion(packageName, pkg)) {
        return pkgPath
      }
      if (pkg?.name !== 'weapp-tailwindcss') {
        return undefined
      }
    }
    const parent = path.dirname(current)
    if (parent === current) {
      return undefined
    }
    current = parent
  }
}

function readDeclaredPackageVersion(packageName: string, pkg: PackageJsonLike | undefined) {
  return pkg?.dependencies?.[packageName]
    ?? pkg?.devDependencies?.[packageName]
    ?? pkg?.peerDependencies?.[packageName]
    ?? pkg?.optionalDependencies?.[packageName]
}

function readDeclaredPackageMajorVersion(version: string | undefined) {
  const match = version?.match(/(?:^|\D)(4)(?:\.|\b)/)
  return normalizeSupportedTailwindcssMajorVersion(match ? Number(match[1]) : undefined)
}

export function readInstalledPackageMajorVersion(
  packageName: string,
  base: string,
): SupportedTailwindcssMajorVersion | undefined {
  const packageJsonPath = findPackageJsonDeclaringPackage(packageName, base)
  if (!packageJsonPath) {
    return undefined
  }
  const declaredVersion = readDeclaredPackageVersion(packageName, readPackageJson(packageJsonPath))
  if (!declaredVersion) {
    return undefined
  }
  try {
    const require = createRequire(packageJsonPath)
    const pkg = require(`${packageName}/package.json`) as { version?: string }
    const major = Number(pkg.version?.split('.')[0])
    return normalizeSupportedTailwindcssMajorVersion(major)
  }
  catch {
    return readDeclaredPackageMajorVersion(declaredVersion)
  }
}
