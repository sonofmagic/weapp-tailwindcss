import type { PackageResolvingOptions } from 'local-pkg'
import type { ILengthUnitsPatchOptions, TailwindcssPatchOptions } from 'tailwindcss-patch'

type TailwindUserOptions = NonNullable<TailwindcssPatchOptions['tailwind']>
type TailwindFeaturesOptions = NonNullable<TailwindcssPatchOptions['features']>
type TailwindExtendLengthUnitsOption = TailwindFeaturesOptions['extendLengthUnits']

export interface LegacyTailwindcssPatcherOptions {
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

export function normalizeExtendLengthUnits(
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

export function normalizeTailwindcssPatcherOptions(
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
