import type { PackageResolvingOptions } from 'local-pkg'
import type { UserDefinedOptions } from '@/types'
import process from 'node:process'
import { resolveTailwindcssBasedir } from '@/context/tailwindcss'
import { resolvePlatform, resolveUniPlatformsFromEnv } from '@/framework'
import { defuOverrideArray } from '@/utils'
import { omitUndefined } from '@/utils/object'

export interface BasePresetOptions extends Omit<Partial<UserDefinedOptions>, 'cssEntries'> {
  base?: string
  cssEntries?: string | string[]
  resolve?: PackageResolvingOptions
  rawOptions?: UserDefinedOptions
}

export function normalizeCssEntries(entries?: string | string[]) {
  if (!entries) {
    return undefined
  }
  const normalized = Array.isArray(entries) ? entries : [entries]
  return normalized.length > 0 ? normalized : undefined
}

export function shouldEnableWebCompatFromEnv() {
  const { uniPlatform, uniUtsPlatform } = resolveUniPlatformsFromEnv()
  return uniPlatform.isWeb
    || uniUtsPlatform.isWeb
    || resolvePlatform(process.env['TARO_ENV']).isWeb
}

export function withWebCompatGeneratorDefaults<T extends { generator?: UserDefinedOptions['generator'] }>(
  options: T,
  enabled = shouldEnableWebCompatFromEnv(),
): T {
  if (!enabled) {
    return options
  }
  return {
    ...options,
    generator: defuOverrideArray<UserDefinedOptions['generator'], NonNullable<UserDefinedOptions['generator']>[]>(
      options.generator ?? {},
      {
        target: 'web',
        webCompat: true,
      },
    ),
  }
}

export function createBasePreset(options: BasePresetOptions = {}) {
  const {
    base,
    cssEntries,
    resolve,
    rawOptions,
    ...userOptions
  } = options

  const baseDir = resolveTailwindcssBasedir(base)
  const normalizedCssEntries = normalizeCssEntries(cssEntries)

  const tailwindConfig: NonNullable<UserDefinedOptions['tailwindcss']> = {
    v4: omitUndefined({
      base: baseDir,
      cssEntries: normalizedCssEntries,
    }),
  }

  if (normalizedCssEntries && normalizedCssEntries.length > 0) {
    tailwindConfig.version = 4
  }

  const patchTailwindConfig: NonNullable<UserDefinedOptions['tailwindcss']> = resolve
    ? {
        ...tailwindConfig,
        resolve,
      }
    : tailwindConfig

  const preset: Partial<UserDefinedOptions> = {
    tailwindcssBasedir: baseDir,
    tailwindcss: tailwindConfig,
    tailwindcssRuntimeOptions: {
      projectRoot: baseDir,
      tailwindcss: patchTailwindConfig,
    },
  }

  const mergedUserOptions = defuOverrideArray<
    Partial<UserDefinedOptions>,
    Partial<UserDefinedOptions>[]
  >(userOptions, rawOptions ?? {})

  return defuOverrideArray<Partial<UserDefinedOptions>, Partial<UserDefinedOptions>[]>(
    mergedUserOptions,
    preset,
  )
}
