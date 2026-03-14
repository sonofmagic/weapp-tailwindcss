import type { PackageResolvingOptions } from 'local-pkg'
import type { ILengthUnitsPatchOptions, TailwindcssPatchOptions } from 'tailwindcss-patch'

type TailwindUserOptions = NonNullable<TailwindcssPatchOptions['tailwindcss']>
type TailwindApplyOptions = NonNullable<TailwindcssPatchOptions['apply']>
type TailwindExtractOptions = NonNullable<TailwindcssPatchOptions['extract']>
type TailwindExtendLengthUnitsOption = TailwindApplyOptions['extendLengthUnits']

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

export function resolveTailwindcssOptions(
  options?: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptions,
) {
  if (!options) {
    return undefined
  }
  return options.tailwindcss ?? (options as TailwindcssPatchOptions).tailwind
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

    const apply: TailwindApplyOptions = {}
    const extract: TailwindExtractOptions = {}

    if (patch?.overwrite !== undefined) {
      apply.overwrite = patch.overwrite
    }

    if (patch?.filter) {
      normalized.filter = patch.filter
    }

    const extendLengthUnits = normalizeExtendLengthUnits(patch?.applyPatches?.extendLengthUnits)
    const exposeContext = patch?.applyPatches?.exportContext

    if (extendLengthUnits !== undefined || exposeContext !== undefined) {
      apply.exposeContext = exposeContext
      apply.extendLengthUnits = extendLengthUnits
    }

    const cwd = patch?.cwd ?? patch?.basedir
    if (cwd) {
      normalized.projectRoot = cwd
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

      normalized.tailwindcss = {
        ...(nextTailwindOptions ?? {}),
        ...(mergedResolve ? { resolve: mergedResolve } : {}),
      }
    }

    if (patch?.output) {
      if (patch.output.filename !== undefined) {
        extract.file = patch.output.filename
      }
      if (patch.output.loose !== undefined) {
        extract.pretty = patch.output.loose ? 2 : false
      }
      if (patch.output.removeUniversalSelector !== undefined) {
        extract.removeUniversalSelector = patch.output.removeUniversalSelector
      }
    }

    if (Object.keys(apply).length > 0) {
      normalized.apply = apply
    }

    if (Object.keys(extract).length > 0) {
      normalized.extract = extract
    }

    return toModernTailwindcssPatchOptions(normalized)
  }

  return toModernTailwindcssPatchOptions(options)
}

export function toModernTailwindcssPatchOptions(
  options?: TailwindcssPatchOptions,
): TailwindcssPatchOptions | undefined {
  if (!options) {
    return undefined
  }

  const normalized: TailwindcssPatchOptions = {}

  if (options.cache !== undefined) {
    normalized.cache = options.cache
  }
  if (options.filter) {
    normalized.filter = options.filter
  }

  const projectRoot = options.projectRoot ?? options.cwd
  if (projectRoot) {
    normalized.projectRoot = projectRoot
  }

  const tailwindcss = resolveTailwindcssOptions(options)
  if (tailwindcss) {
    normalized.tailwindcss = {
      ...tailwindcss,
    }
  }

  const apply: TailwindApplyOptions = {
    ...(options.apply ?? {}),
  }
  if (apply.overwrite === undefined && options.overwrite !== undefined) {
    apply.overwrite = options.overwrite
  }
  if (apply.exposeContext === undefined && options.features?.exposeContext !== undefined) {
    apply.exposeContext = options.features.exposeContext
  }
  if (apply.extendLengthUnits === undefined && options.features?.extendLengthUnits !== undefined) {
    apply.extendLengthUnits = options.features.extendLengthUnits as TailwindApplyOptions['extendLengthUnits']
  }
  if (Object.keys(apply).length > 0) {
    normalized.apply = apply
  }

  const extract: TailwindExtractOptions = {
    ...(options.extract ?? {}),
  }
  if (options.output) {
    if (extract.write === undefined && options.output.enabled !== undefined) {
      extract.write = options.output.enabled
    }
    if (extract.file === undefined && options.output.file !== undefined) {
      extract.file = options.output.file
    }
    if (extract.format === undefined && options.output.format !== undefined) {
      extract.format = options.output.format
    }
    if (extract.pretty === undefined && options.output.pretty !== undefined) {
      extract.pretty = options.output.pretty
    }
    if (extract.removeUniversalSelector === undefined && options.output.removeUniversalSelector !== undefined) {
      extract.removeUniversalSelector = options.output.removeUniversalSelector
    }
  }
  if (Object.keys(extract).length > 0) {
    normalized.extract = extract
  }

  return normalized
}
