import type { TailwindcssPatchOptions } from 'tailwindcss-patch'

type TailwindUserOptions = NonNullable<TailwindcssPatchOptions['tailwindcss']>

export interface LegacyTailwindcssPatcherOptionsLike {
  patch?: {
    basedir?: string
    cwd?: string
    tailwindcss?: TailwindUserOptions & {
      v4?: {
        base?: string
        cssEntries?: string[]
      }
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}

type ModernTailwindcssPatchOptionsLike = TailwindcssPatchOptions
type TailwindcssPatcherOptionsForBase = TailwindcssPatchOptions | LegacyTailwindcssPatcherOptionsLike | undefined

function isLegacyTailwindcssPatcherOptions(
  options: TailwindcssPatcherOptionsForBase,
): options is LegacyTailwindcssPatcherOptionsLike {
  return typeof options === 'object' && options !== null && 'patch' in options
}

function isModernTailwindcssPatchOptions(
  options: TailwindcssPatcherOptionsForBase,
): options is ModernTailwindcssPatchOptionsLike {
  return typeof options === 'object' && options !== null && !('patch' in options)
}

export function overrideTailwindcssPatcherOptionsForBase(
  options: TailwindcssPatcherOptionsForBase,
  baseDir: string,
  cssEntries: string[],
): TailwindcssPatcherOptionsForBase {
  const hasCssEntries = cssEntries.length > 0

  if (!options) {
    return options
  }

  if (isLegacyTailwindcssPatcherOptions(options)) {
    const patchOptions = options.patch
    if (!patchOptions) {
      return options
    }
    const nextPatch = {
      ...patchOptions,
      basedir: baseDir,
      cwd: patchOptions.cwd ?? baseDir,
    }
    if (patchOptions.tailwindcss) {
      const nextV4 = {
        ...(patchOptions.tailwindcss.v4 ?? {}),
      }

      if (hasCssEntries) {
        nextV4.cssEntries = cssEntries
      }
      else {
        nextV4.cssEntries = nextV4.cssEntries ?? cssEntries
        if (nextV4.base === undefined) {
          nextV4.base = baseDir
        }
      }

      nextPatch.tailwindcss = {
        ...patchOptions.tailwindcss,
        v4: nextV4,
      }
    }
    return {
      ...options,
      patch: nextPatch,
    }
  }

  if (!isModernTailwindcssPatchOptions(options)) {
    return options
  }

  const modernTailwind = options.tailwindcss ?? (options as any).tailwind
  if (!modernTailwind) {
    return options
  }

  const { tailwind: _legacyTailwind, ...rest } = options as TailwindcssPatchOptions & { tailwind?: TailwindUserOptions }

  return {
    ...rest,
    tailwindcss: {
      ...modernTailwind,
      v4: {
        ...(modernTailwind.v4 ?? {}),
        ...(hasCssEntries ? {} : { base: modernTailwind.v4?.base ?? baseDir }),
        cssEntries: hasCssEntries
          ? cssEntries
          : modernTailwind.v4?.cssEntries ?? cssEntries,
      },
    },
  }
}
