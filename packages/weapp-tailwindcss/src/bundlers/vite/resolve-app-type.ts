import type { AppType } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

interface PackageJsonLike {
  'dependencies'?: Record<string, string>
  'devDependencies'?: Record<string, string>
  'peerDependencies'?: Record<string, string>
  'optionalDependencies'?: Record<string, string>
  'scripts'?: Record<string, string>
  'uni-app'?: unknown
}

interface UniAppManifestLike {
  'uni-app-x'?: unknown
}

const PACKAGE_JSON_FILE = 'package.json'
const MPX_SCRIPT_RE = /\bmpx(?:-cli-service)?\b/u
const TARO_SCRIPT_RE = /\btaro\b/u
const TAILWINDCSS_VITE_MARKERS: Array<[string, AppType]> = [
  ['src/app.mpx', 'mpx'],
  ['app.mpx', 'mpx'],
]

function resolveDependencyNames(pkg: PackageJsonLike) {
  return new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkg.optionalDependencies ?? {}),
  ])
}

function hasScriptMatch(pkg: PackageJsonLike, pattern: RegExp) {
  return Object.values(pkg.scripts ?? {}).some(script => pattern.test(script))
}

function resolveAppTypeFromPackageJson(pkg: PackageJsonLike): AppType | undefined {
  const dependencyNames = resolveDependencyNames(pkg)

  if (
    [...dependencyNames].some(name => name.startsWith('@mpxjs/'))
    || hasScriptMatch(pkg, MPX_SCRIPT_RE)
  ) {
    return 'mpx'
  }

  if (
    [...dependencyNames].some(name => name.startsWith('@tarojs/'))
    || hasScriptMatch(pkg, TARO_SCRIPT_RE)
  ) {
    return 'taro'
  }

  if (dependencyNames.has('@dcloudio/vite-plugin-uni')) {
    return 'uni-app-vite'
  }

  if (
    dependencyNames.has('@dcloudio/vue-cli-plugin-uni')
    || dependencyNames.has('@dcloudio/uni-app')
    || Object.hasOwn(pkg, 'uni-app')
  ) {
    return 'uni-app'
  }
}

function tryReadUniAppManifest(root: string): UniAppManifestLike | undefined {
  const manifestPath = path.join(root, 'manifest.json')
  if (!existsSync(manifestPath)) {
    return
  }

  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8')) as UniAppManifestLike
  }
  catch {

  }
}

function tryReadPackageJson(root: string): PackageJsonLike | undefined {
  const packageJsonPath = path.join(root, PACKAGE_JSON_FILE)
  if (!existsSync(packageJsonPath)) {
    return
  }

  try {
    return JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJsonLike
  }
  catch {

  }
}

function resolveAppTypeFromMarkers(root: string): AppType | undefined {
  for (const [relativePath, appType] of TAILWINDCSS_VITE_MARKERS) {
    if (existsSync(path.join(root, relativePath))) {
      return appType
    }
  }
}

export function resolveImplicitAppTypeFromViteRoot(root: string): AppType | undefined {
  const resolvedRoot = path.resolve(root)
  if (!existsSync(resolvedRoot)) {
    return
  }

  const markerDetected = resolveAppTypeFromMarkers(resolvedRoot)
  if (markerDetected) {
    return markerDetected
  }

  let current = resolvedRoot
  while (true) {
    const manifest = tryReadUniAppManifest(current)
    if (manifest && Object.hasOwn(manifest, 'uni-app-x')) {
      return 'uni-app-x'
    }

    const pkg = tryReadPackageJson(current)
    if (pkg) {
      const detected = resolveAppTypeFromPackageJson(pkg)
      if (detected) {
        return detected
      }
    }

    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }
}
