import type { PackageResolvingOptions } from 'local-pkg'
import type { UserDefinedOptions } from '@/types'
import { resolveTailwindcssBasedir } from '@/context/tailwindcss'
import { defuOverrideArray } from '@/utils'

export interface BasePresetOptions {
  base?: string
  cssEntries?: string | string[]
  rem2rpx?: UserDefinedOptions['rem2rpx']
  rawOptions?: UserDefinedOptions
  resolve?: PackageResolvingOptions
  customAttributes?: UserDefinedOptions['customAttributes']
  disabled?: UserDefinedOptions['disabled']
}

export function normalizeCssEntries(entries?: string | string[]) {
  if (!entries) {
    return undefined
  }
  const normalized = Array.isArray(entries) ? entries : [entries]
  return normalized.length > 0 ? normalized : undefined
}

export function createBasePreset(options: BasePresetOptions = {}) {
  const baseDir = resolveTailwindcssBasedir(options.base)
  const cssEntries = normalizeCssEntries(options.cssEntries)

  const tailwindConfig: NonNullable<UserDefinedOptions['tailwindcss']> = {
    v2: { cwd: baseDir },
    v3: { cwd: baseDir },
    v4: {
      base: baseDir,
      cssEntries,
    },
  }

  if (cssEntries && cssEntries.length > 0) {
    tailwindConfig.version = 4
  }

  const patchTailwindConfig: NonNullable<UserDefinedOptions['tailwindcss']> = options.resolve
    ? {
        ...tailwindConfig,
        resolve: options.resolve,
      }
    : tailwindConfig

  const preset: Partial<UserDefinedOptions> = {
    tailwindcssBasedir: baseDir,
    tailwindcss: tailwindConfig,
    tailwindcssPatcherOptions: {
      cwd: baseDir,
      tailwind: patchTailwindConfig,
    },
  }

  if (options.customAttributes) {
    preset.customAttributes = options.customAttributes
  }

  if (options.disabled !== undefined) {
    preset.disabled = options.disabled
  }

  if (options.rem2rpx !== undefined) {
    preset.rem2rpx = options.rem2rpx
  }

  return defuOverrideArray<
    Partial<UserDefinedOptions>,
    Partial<UserDefinedOptions>[]
  >(
    options.rawOptions ?? {},
    preset,
  )
}
