import type { ILengthUnitsPatchOptions, TailwindcssPatchOptions } from 'tailwindcss-patch'
import type { LegacyTailwindcssPatcherOptions } from './patcher-options'
import type { TailwindcssPatcherLike } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { TailwindcssPatcher } from 'tailwindcss-patch'
import { findNearestPackageRoot } from '@/context/workspace'
import {

  normalizeExtendLengthUnits,
  normalizeTailwindcssPatcherOptions,
} from './patcher-options'
import {
  createDefaultResolvePaths,
  findTailwindConfig,
  resolveModuleFromPaths,
  resolveTailwindConfigFallback,
} from './patcher-resolve'

type TailwindcssExtractOptions = Parameters<TailwindcssPatcher['extract']>[0]
type TailwindcssExtractResult = ReturnType<TailwindcssPatcher['extract']>
type TailwindUserOptions = NonNullable<TailwindcssPatchOptions['tailwind']>
type TailwindCacheOptions = Exclude<NonNullable<TailwindcssPatchOptions['cache']>, boolean>

export interface CreateTailwindcssPatcherOptions {
  basedir?: string
  cacheDir?: string
  supportCustomLengthUnitsPatch?: boolean | ILengthUnitsPatchOptions
  tailwindcss?: TailwindUserOptions
  tailwindcssPatcherOptions?: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptions
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
    async collectContentTokens() {
      return {
        entries: [],
        filesScanned: 0,
        sources: [],
        skippedFiles: [],
      }
    },
  }
}

let hasLoggedMissingTailwind = false

export function createTailwindcssPatcher(options?: CreateTailwindcssPatcherOptions): TailwindcssPatcherLike {
  const { basedir, cacheDir, supportCustomLengthUnitsPatch, tailwindcss, tailwindcssPatcherOptions } = options || {}
  const cache: TailwindCacheOptions = {
    driver: 'memory',
  }
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

  const extendLengthUnits = normalizeExtendLengthUnits(supportCustomLengthUnitsPatch ?? true)

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
