import type { PackageResolvingOptions } from 'local-pkg'
import type { ILengthUnitsPatchOptions, TailwindcssPatchOptions } from 'tailwindcss-patch'
import type { TailwindcssPatcherLike } from '@/types'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { logger } from '@weapp-tailwindcss/logger'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { TailwindcssPatcher } from 'tailwindcss-patch'

type TailwindcssExtractOptions = Parameters<TailwindcssPatcher['extract']>[0]
type TailwindcssExtractResult = ReturnType<TailwindcssPatcher['extract']>
type TailwindUserOptions = NonNullable<TailwindcssPatchOptions['tailwind']>
type TailwindCacheOptions = Exclude<NonNullable<TailwindcssPatchOptions['cache']>, boolean>
type TailwindFeaturesOptions = NonNullable<TailwindcssPatchOptions['features']>
type TailwindExtendLengthUnitsOption = TailwindFeaturesOptions['extendLengthUnits']
const GENERIC_RELATIVE_SPECIFIERS = ['.', '..']
const DEFAULT_TAILWIND_CONFIG_SPECIFIERS = [
  'stubs/config.full.js',
  'defaultConfig.js',
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

function resolveModuleFromPaths(specifier: string | undefined, paths: string[]) {
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

function resolveTailwindConfigFallback(
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

export interface CreateTailwindcssPatcherOptions {
  basedir?: string
  cacheDir?: string
  supportCustomLengthUnitsPatch?: boolean | ILengthUnitsPatchOptions
  tailwindcss?: TailwindUserOptions
  tailwindcssPatcherOptions?: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptions
}

interface LegacyTailwindcssPatcherOptions {
  cache?: boolean | {
    enabled?: boolean
    cwd?: string
    dir?: string
    file?: string
    strategy?: 'merge' | 'overwrite'
  }
  patch?: {
    overwrite?: boolean
    basedir?: string
    cwd?: string
    filter?: (className: string) => boolean
    resolve?: PackageResolvingOptions
    tailwindcss?: TailwindUserOptions
    applyPatches?: {
      exportContext?: boolean
      extendLengthUnits?: boolean | ILengthUnitsPatchOptions
    }
  }
}

function createFallbackTailwindcssPatcher(): TailwindcssPatcherLike {
  const packageInfo = {
    name: 'tailwindcss',
    version: undefined as unknown as string,
    rootPath: '',
    packageJsonPath: '',
    packageJson: {},
  } as TailwindcssPatcherLike['packageInfo']

  return {
    packageInfo,
    async patch() {
      return {
        exposeContext: undefined,
        extendLengthUnits: undefined,
      }
    },
    async getClassSet() {
      return new Set<string>()
    },
    async extract(_options?: TailwindcssExtractOptions): TailwindcssExtractResult {
      const classSet = new Set<string>()
      return {
        classList: [],
        classSet,
      } as Awaited<TailwindcssExtractResult>
    },
  }
}

let hasLoggedMissingTailwind = false

function findNearestPackageRoot(startDir?: string) {
  if (!startDir) {
    return undefined
  }

  let current = path.resolve(startDir)
  while (true) {
    const pkgPath = path.join(current, 'package.json')
    if (existsSync(pkgPath)) {
      return current
    }
    const parent = path.dirname(current)
    if (parent === current) {
      return undefined
    }
    current = parent
  }
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

const TAILWIND_CONFIG_FILES = [
  'tailwind.config.js',
  'tailwind.config.cjs',
  'tailwind.config.mjs',
  'tailwind.config.ts',
  'tailwind.config.cts',
  'tailwind.config.mts',
]

function findTailwindConfig(searchRoots: Iterable<string>): string | undefined {
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

function createDefaultResolvePaths(basedir?: string) {
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
    // Fallback for environments where fileURLToPath is not applicable
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

function normalizeExtendLengthUnits(
  value: boolean | ILengthUnitsPatchOptions | undefined,
): TailwindExtendLengthUnitsOption | undefined {
  if (value === false) {
    return false
  }
  if (value === true) {
    return { enabled: true }
  }
  if (value && typeof value === 'object') {
    return {
      enabled: true,
      ...value,
    }
  }
  return undefined
}

function normalizeTailwindcssPatcherOptions(
  options?: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptions,
): TailwindcssPatchOptions | undefined {
  if (!options) {
    return undefined
  }

  if ('patch' in options) {
    const { cache, patch } = options
    const normalized: TailwindcssPatchOptions = {}

    if (cache !== undefined) {
      normalized.cache = cache
    }

    if (patch?.overwrite !== undefined) {
      normalized.overwrite = patch.overwrite
    }

    if (patch?.filter) {
      normalized.filter = patch.filter
    }

    const extendLengthUnits = normalizeExtendLengthUnits(patch?.applyPatches?.extendLengthUnits)
    const exposeContext = patch?.applyPatches?.exportContext

    if (extendLengthUnits !== undefined || exposeContext !== undefined) {
      normalized.features = {
        exposeContext,
        extendLengthUnits,
      }
    }

    const cwd = patch?.cwd ?? patch?.basedir
    if (cwd) {
      normalized.cwd = cwd
    }

    const tailwindOptions: TailwindUserOptions | undefined = patch?.tailwindcss
      ? { ...patch.tailwindcss }
      : undefined
    const legacyResolve = patch?.resolve

    let nextTailwindOptions = tailwindOptions
    if (nextTailwindOptions?.version === 2 && !nextTailwindOptions.packageName) {
      nextTailwindOptions = {
        ...nextTailwindOptions,
        packageName: '@tailwindcss/postcss7-compat',
        postcssPlugin: nextTailwindOptions.postcssPlugin,
      }
      if (!nextTailwindOptions.postcssPlugin) {
        nextTailwindOptions.postcssPlugin = '@tailwindcss/postcss7-compat'
      }
    }

    if (nextTailwindOptions || legacyResolve) {
      const resolveOptions = nextTailwindOptions?.resolve
      const mergedResolve = legacyResolve || resolveOptions
        ? {
            ...(resolveOptions ?? {}),
            ...(legacyResolve ?? {}),
          }
        : undefined

      normalized.tailwind = {
        ...(nextTailwindOptions ?? {}),
        ...(mergedResolve ? { resolve: mergedResolve } : {}),
      }
    }

    return normalized
  }

  return options
}

export function createTailwindcssPatcher(options?: CreateTailwindcssPatcherOptions): TailwindcssPatcherLike {
  const { basedir, cacheDir, supportCustomLengthUnitsPatch, tailwindcss, tailwindcssPatcherOptions } = options || {}
  const cache: TailwindCacheOptions = {}
  const normalizedBasedir = basedir ? path.resolve(basedir) : undefined
  const cacheRoot = findNearestPackageRoot(normalizedBasedir) ?? normalizedBasedir ?? process.cwd()

  if (cacheDir) {
    if (path.isAbsolute(cacheDir)) {
      cache.dir = cacheDir
    }
    else if (normalizedBasedir) {
      cache.dir = path.resolve(normalizedBasedir, cacheDir)
    }
    else {
      cache.dir = path.resolve(process.cwd(), cacheDir)
    }
  }
  else {
    cache.dir = path.join(cacheRoot, 'node_modules', '.cache', 'tailwindcss-patch')
  }

  if (normalizedBasedir) {
    cache.cwd = normalizedBasedir
  }

  const resolvePaths = createDefaultResolvePaths(cache.cwd ?? normalizedBasedir ?? process.cwd())

  const normalizedUserOptions = normalizeTailwindcssPatcherOptions(tailwindcssPatcherOptions)

  const extendLengthUnits = normalizeExtendLengthUnits(supportCustomLengthUnitsPatch)

  const baseTailwindOptions = defuOverrideArray<TailwindUserOptions, Partial<TailwindUserOptions>[]>(
    (tailwindcss ?? {}) as TailwindUserOptions,
    {
      cwd: normalizedBasedir,
      resolve: {
        paths: resolvePaths,
      },
    },
  )

  if (baseTailwindOptions.version === 2) {
    if (!baseTailwindOptions.packageName) {
      baseTailwindOptions.packageName = '@tailwindcss/postcss7-compat'
    }
    if (!baseTailwindOptions.postcssPlugin) {
      baseTailwindOptions.postcssPlugin = '@tailwindcss/postcss7-compat'
    }
  }
  else if (!baseTailwindOptions.packageName) {
    baseTailwindOptions.packageName = 'tailwindcss'
  }

  if (!baseTailwindOptions.postcssPlugin) {
    baseTailwindOptions.postcssPlugin = baseTailwindOptions.version === 4
      ? '@tailwindcss/postcss'
      : 'tailwindcss'
  }

  if (typeof baseTailwindOptions.postcssPlugin === 'string') {
    const resolvedPlugin = resolveModuleFromPaths(baseTailwindOptions.postcssPlugin, resolvePaths)
    if (resolvedPlugin) {
      baseTailwindOptions.postcssPlugin = resolvedPlugin
    }
  }

  const baseOptions: TailwindcssPatchOptions = {
    cwd: normalizedBasedir,
    cache,
    tailwind: baseTailwindOptions,
    features: {
      exposeContext: true,
      extendLengthUnits,
    },
  }

  const resolvedOptions = defuOverrideArray<TailwindcssPatchOptions, TailwindcssPatchOptions[]>(
    (normalizedUserOptions ?? {}) as TailwindcssPatchOptions,
    baseOptions,
  )

  if (resolvedOptions.tailwind) {
    const existingResolve = resolvedOptions.tailwind.resolve ?? {}
    const customPaths = Array.isArray(existingResolve.paths) && existingResolve.paths.length > 0
    const sourcePaths = customPaths ? existingResolve.paths : resolvePaths
    resolvedOptions.tailwind.resolve = {
      ...existingResolve,
      paths: Array.from(new Set(sourcePaths)),
    }
    logger.debug('Tailwind resolve config %O', {
      packageName: resolvedOptions.tailwind.packageName,
      version: resolvedOptions.tailwind.version,
      resolve: resolvedOptions.tailwind.resolve,
      cwd: resolvedOptions.tailwind.cwd,
    })

    if (typeof resolvedOptions.tailwind.postcssPlugin === 'string') {
      const resolvedPlugin = resolveModuleFromPaths(
        resolvedOptions.tailwind.postcssPlugin,
        resolvedOptions.tailwind.resolve?.paths ?? resolvePaths,
      )
      if (resolvedPlugin) {
        resolvedOptions.tailwind.postcssPlugin = resolvedPlugin
      }
    }

    const searchRoots = new Set<string>()
    if (resolvedOptions.tailwind.cwd) {
      searchRoots.add(resolvedOptions.tailwind.cwd)
    }
    for (const resolvePath of resolvedOptions.tailwind.resolve?.paths ?? []) {
      const parentDir = path.dirname(resolvePath)
      searchRoots.add(parentDir)
    }
    const configPath = findTailwindConfig(searchRoots)
    if (!resolvedOptions.tailwind.config) {
      if (configPath) {
        resolvedOptions.tailwind.config = configPath
      }
      else {
        const fallbackConfig = resolveTailwindConfigFallback(
          resolvedOptions.tailwind.packageName,
          resolvedOptions.tailwind.resolve.paths ?? resolvePaths,
        )
        if (fallbackConfig) {
          resolvedOptions.tailwind.config = fallbackConfig
        }
      }
    }
    if (!resolvedOptions.tailwind.cwd && configPath) {
      resolvedOptions.tailwind.cwd = path.dirname(configPath)
    }
  }

  try {
    return new TailwindcssPatcher(resolvedOptions)
  }
  catch (error) {
    const searchPaths = resolvedOptions.tailwind?.resolve?.paths
    if (error instanceof Error && /tailwindcss not found/i.test(error.message)) {
      if (!hasLoggedMissingTailwind) {
        logger.warn('Tailwind CSS 未安装，已跳过 Tailwind 相关补丁。若需使用 Tailwind 能力，请安装 tailwindcss。')
        hasLoggedMissingTailwind = true
      }
      return createFallbackTailwindcssPatcher()
    }
    if (error instanceof Error && /unable to locate tailwind css package/i.test(error.message)) {
      logger.error('无法定位 Tailwind CSS 包 "%s"，已尝试路径: %O', resolvedOptions.tailwind?.packageName, searchPaths)
    }
    throw error
  }
}
