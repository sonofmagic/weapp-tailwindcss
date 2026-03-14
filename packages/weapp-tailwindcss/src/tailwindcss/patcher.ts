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
  toModernTailwindcssPatchOptions,
} from './patcher-options'
import {
  createDefaultResolvePaths,
  findTailwindConfig,
  resolveModuleFromPaths,
  resolveTailwindConfigFallback,
} from './patcher-resolve'

type TailwindcssExtractOptions = Parameters<TailwindcssPatcher['extract']>[0]
type TailwindcssExtractResult = ReturnType<TailwindcssPatcher['extract']>
type TailwindUserOptions = NonNullable<TailwindcssPatchOptions['tailwindcss']>
type TailwindCacheOptions = Exclude<NonNullable<TailwindcssPatchOptions['cache']>, boolean>
type TailwindApplyOptions = NonNullable<TailwindcssPatchOptions['apply']>

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

const TAILWINDCSS_NOT_FOUND_RE = /tailwindcss not found/i
const UNABLE_TO_LOCATE_TAILWINDCSS_RE = /unable to locate tailwind css package/i

function isTailwindcssV4PackageName(packageName: string | undefined) {
  return packageName === '@tailwindcss/postcss'
    || packageName === 'tailwindcss4'
    || Boolean(packageName && packageName.includes('tailwindcss4'))
}

export function createTailwindcssPatcher(options?: CreateTailwindcssPatcherOptions): TailwindcssPatcherLike {
  const { basedir, cacheDir, supportCustomLengthUnitsPatch, tailwindcss, tailwindcssPatcherOptions } = options || {}
  const cache: TailwindCacheOptions = {
    driver: 'memory',
  }
  const normalizedBasedir = basedir ? path.resolve(basedir) : undefined
  // 8.7+ 自带 context fingerprint，默认可安全共享缓存文件。
  // 这里优先维持包级缓存目录，避免把缓存散落到 src 等子目录。
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
    baseTailwindOptions.postcssPlugin = baseTailwindOptions.version === 4 || isTailwindcssV4PackageName(baseTailwindOptions.packageName)
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
    projectRoot: normalizedBasedir,
    cache,
    tailwindcss: baseTailwindOptions,
    apply: {
      exposeContext: true,
      extendLengthUnits,
    } satisfies TailwindApplyOptions,
  }

  const mergedOptions = defuOverrideArray<TailwindcssPatchOptions, TailwindcssPatchOptions[]>(
    (normalizedUserOptions ?? {}) as TailwindcssPatchOptions,
    baseOptions,
  )
  const resolvedOptions = toModernTailwindcssPatchOptions(mergedOptions) ?? {}
  const resolvedTailwindOptions: TailwindUserOptions | undefined = resolvedOptions.tailwindcss

  if (resolvedTailwindOptions) {
    const existingResolve = resolvedTailwindOptions.resolve ?? {}
    const customPaths = Array.isArray(existingResolve.paths) && existingResolve.paths.length > 0
    const sourcePaths = customPaths ? existingResolve.paths : resolvePaths
    resolvedTailwindOptions.resolve = {
      ...existingResolve,
      paths: [...new Set(sourcePaths)],
    }
    logger.debug('Tailwind resolve config %O', {
      packageName: resolvedTailwindOptions.packageName,
      version: resolvedTailwindOptions.version,
      resolve: resolvedTailwindOptions.resolve,
      cwd: resolvedTailwindOptions.cwd,
    })

    if (typeof resolvedTailwindOptions.postcssPlugin === 'string') {
      const resolvedPlugin = resolveModuleFromPaths(
        resolvedTailwindOptions.postcssPlugin,
        resolvedTailwindOptions.resolve?.paths ?? resolvePaths,
      )
      if (resolvedPlugin) {
        resolvedTailwindOptions.postcssPlugin = resolvedPlugin
      }
    }

    const searchRoots = new Set<string>()
    if (resolvedTailwindOptions.cwd) {
      searchRoots.add(resolvedTailwindOptions.cwd)
    }
    for (const resolvePath of resolvedTailwindOptions.resolve?.paths ?? []) {
      const parentDir = path.dirname(resolvePath)
      searchRoots.add(parentDir)
    }
    const configPath = findTailwindConfig(searchRoots)
    if (!resolvedTailwindOptions.config) {
      if (configPath) {
        resolvedTailwindOptions.config = configPath
      }
      else {
        const fallbackConfig = resolveTailwindConfigFallback(
          resolvedTailwindOptions.packageName,
          resolvedTailwindOptions.resolve.paths ?? resolvePaths,
        )
        if (fallbackConfig) {
          resolvedTailwindOptions.config = fallbackConfig
        }
      }
    }
    if (!resolvedTailwindOptions.cwd && configPath) {
      resolvedTailwindOptions.cwd = path.dirname(configPath)
    }
    resolvedOptions.tailwindcss = resolvedTailwindOptions
  }

  try {
    return new TailwindcssPatcher(resolvedOptions)
  }
  catch (error) {
    const searchPaths = resolvedOptions.tailwindcss?.resolve?.paths
    if (error instanceof Error && TAILWINDCSS_NOT_FOUND_RE.test(error.message)) {
      if (!hasLoggedMissingTailwind) {
        logger.warn('Tailwind CSS 未安装，已跳过 Tailwind 相关补丁。若需使用 Tailwind 能力，请安装 tailwindcss。')
        hasLoggedMissingTailwind = true
      }
      return createFallbackTailwindcssPatcher()
    }
    if (error instanceof Error && UNABLE_TO_LOCATE_TAILWINDCSS_RE.test(error.message)) {
      logger.error('无法定位 Tailwind CSS 包 "%s"，已尝试路径: %O', resolvedOptions.tailwindcss?.packageName, searchPaths)
    }
    throw error
  }
}
