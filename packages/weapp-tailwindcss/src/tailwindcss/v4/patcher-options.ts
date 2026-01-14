import type { TailwindcssPatchOptions } from 'tailwindcss-patch'

type TailwindUserOptions = NonNullable<TailwindcssPatchOptions['tailwind']>

interface LegacyTailwindcssPatcherOptionsLike {
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

function isLegacyTailwindcssPatcherOptions(
  options: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptionsLike | undefined,
): options is LegacyTailwindcssPatcherOptionsLike {
  return typeof options === 'object' && options !== null && 'patch' in options
}

function isModernTailwindcssPatchOptions(
  options: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptionsLike | undefined,
): options is ModernTailwindcssPatchOptionsLike {
  return typeof options === 'object' && options !== null && !('patch' in options)
}

export function overrideTailwindcssPatcherOptionsForBase(
  options: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptionsLike | undefined,
  baseDir: string,
  cssEntries: string[],
) {
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

  if (!options.tailwind) {
    return options
  }

  return {
    ...options,
    tailwind: {
      ...options.tailwind,
      v4: {
        ...(options.tailwind.v4 ?? {}),
        ...(hasCssEntries ? {} : { base: options.tailwind.v4?.base ?? baseDir }),
        cssEntries: hasCssEntries
          ? cssEntries
          : options.tailwind.v4?.cssEntries ?? cssEntries,
      },
    },
  }
}
