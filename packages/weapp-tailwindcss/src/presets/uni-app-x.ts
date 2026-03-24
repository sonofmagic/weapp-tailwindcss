import type { PackageResolvingOptions } from 'local-pkg'
import type { UserDefinedOptions } from '@/types'
import process from 'node:process'
import { logger } from '@/logger'
import { getTailwindcssPackageInfo } from '@/tailwindcss'
import { defuOverrideArray, resolveUniUtsPlatform } from '@/utils'
import { normalizeCssEntries } from './shared'

export interface UniAppXOptions {
  base: string
  cssEntries?: string[]
  rem2rpx?: UserDefinedOptions['rem2rpx']
  unitsToPx?: UserDefinedOptions['unitsToPx']
  rawOptions?: UserDefinedOptions
  resolve?: PackageResolvingOptions
  customAttributes?: UserDefinedOptions['customAttributes']
}

function resolveTailwindResolveOptions(base: string, resolve?: PackageResolvingOptions): PackageResolvingOptions {
  const currentPaths = Array.isArray(resolve?.paths) ? resolve.paths : []
  return {
    ...(resolve ?? {}),
    paths: [...new Set([base, ...currentPaths])],
  }
}

function resolveInstalledTailwindDefaults(resolve?: PackageResolvingOptions) {
  const packageInfo = getTailwindcssPackageInfo(resolve)
  const version = packageInfo?.version
  if (!version) {
    return undefined
  }

  const major = Number.parseInt(version.split('.')[0] ?? '', 10)
  if (!Number.isFinite(major)) {
    return undefined
  }

  if (major === 4) {
    return {
      version: 4 as const,
      packageName: 'tailwindcss',
      postcssPlugin: '@tailwindcss/postcss',
    }
  }

  if (major === 3) {
    return {
      version: 3 as const,
      packageName: 'tailwindcss',
      postcssPlugin: 'tailwindcss',
    }
  }

  return undefined
}

export function uniAppX(options: UniAppXOptions) {
  logger.info(`UNI_PLATFORM: ${process.env.UNI_PLATFORM}`)
  const utsPlatform = resolveUniUtsPlatform()
  const uniPlatform = resolveUniUtsPlatform(process.env.UNI_PLATFORM)

  logger.info(`UNI_UTS_PLATFORM: ${utsPlatform.raw ?? 'undefined'}`)

  const isApp = utsPlatform.isApp || uniPlatform.isApp
  const cssEntries = normalizeCssEntries(options.cssEntries)
  const resolvedResolve = resolveTailwindResolveOptions(options.base, options.resolve)
  const installedTailwindDefaults = resolveInstalledTailwindDefaults(resolvedResolve)
  return defuOverrideArray<
    Partial<UserDefinedOptions>,
    Partial<UserDefinedOptions>[]
  >(
    options.rawOptions ?? {},
    {
      uniAppX: isApp,
      rem2rpx: options.rem2rpx,
      unitsToPx: options.unitsToPx,
      tailwindcssBasedir: options.base,
      tailwindcssPatcherOptions: {
        projectRoot: options.base,
        tailwindcss: {
          ...(installedTailwindDefaults ?? {}),
          cwd: options.base,
          resolve: resolvedResolve,
          v3: {
            cwd: options.base,
          },
          v4: {
            base: options.base,
            cssEntries,
          },
        },
      },
      tailwindcss: {
        ...(installedTailwindDefaults ?? {}),
        resolve: resolvedResolve,
      },
      cssPreflight: {
        'border-style': false,
      },
      cssPresetEnv: {
        features: {
          'custom-properties': {
            preserve: false,
          },
        },
      },
      ...(options.customAttributes ? { customAttributes: options.customAttributes } : {}),
    },
  )
}
