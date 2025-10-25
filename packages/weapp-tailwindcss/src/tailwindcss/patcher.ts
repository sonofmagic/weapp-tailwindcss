import type { CacheOptions, ILengthUnitsPatchOptions, TailwindcssPatcherOptions, TailwindcssUserConfig } from 'tailwindcss-patch'
import type { TailwindcssPatcherLike } from '@/types'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { TailwindcssPatcher } from 'tailwindcss-patch'

type TailwindcssExtractOptions = Parameters<TailwindcssPatcher['extract']>[0]
type TailwindcssExtractResult = ReturnType<TailwindcssPatcher['extract']>

export interface CreateTailwindcssPatcherOptions {
  basedir?: string
  cacheDir?: string
  supportCustomLengthUnitsPatch?: boolean | ILengthUnitsPatchOptions
  tailwindcss?: TailwindcssUserConfig
  tailwindcssPatcherOptions?: TailwindcssPatcherOptions
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
    majorVersion: 0,
    patch() {},
    async getClassSet() {
      return new Set<string>()
    },
    async getClassSetV3() {
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

function createDefaultResolvePaths(basedir?: string) {
  const paths = new Set<string>()
  if (basedir) {
    const packageRoot = findNearestPackageRoot(basedir)
    if (packageRoot) {
      const nodeModulesDir = path.join(packageRoot, 'node_modules')
      if (existsSync(nodeModulesDir)) {
        paths.add(nodeModulesDir)
      }
      else {
        paths.add(packageRoot)
      }
    }
  }
  paths.add(import.meta.url)
  return [...paths]
}

export function createTailwindcssPatcher(options?: CreateTailwindcssPatcherOptions): TailwindcssPatcherLike {
  const { basedir, cacheDir, supportCustomLengthUnitsPatch, tailwindcss, tailwindcssPatcherOptions } = options || {}
  const cache: CacheOptions = {}

  if (cacheDir) {
    if (path.isAbsolute(cacheDir)) {
      cache.dir = cacheDir
    }
    else if (basedir) {
      cache.dir = path.resolve(basedir, cacheDir)
    }
    else {
      cache.dir = path.resolve(process.cwd(), cacheDir)
    }
  }

  if (basedir) {
    cache.cwd = basedir
  }

  const resolvePaths = createDefaultResolvePaths(cache.cwd ?? basedir ?? process.cwd())

  const resolvedOptions = defuOverrideArray<TailwindcssPatcherOptions, TailwindcssPatcherOptions[]>(
    tailwindcssPatcherOptions!,
    {
      cache,
      patch: {
        basedir,
        cwd: basedir,
        applyPatches: {
          exportContext: true,
          extendLengthUnits: supportCustomLengthUnitsPatch,
        },
        tailwindcss,
        resolve: {
          paths: resolvePaths,
        },
      },
    },
  )

  try {
    return new TailwindcssPatcher(resolvedOptions)
  }
  catch (error) {
    if (error instanceof Error && /tailwindcss not found/i.test(error.message)) {
      if (!hasLoggedMissingTailwind) {
        logger.warn('Tailwind CSS 未安装，已跳过 Tailwind 相关补丁。若需使用 Tailwind 能力，请安装 tailwindcss。')
        hasLoggedMissingTailwind = true
      }
      return createFallbackTailwindcssPatcher()
    }
    throw error
  }
}
