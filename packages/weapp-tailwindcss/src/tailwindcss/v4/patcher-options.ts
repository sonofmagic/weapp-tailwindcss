import type { TailwindCssPatchOptions } from 'tailwindcss-patch'

export function overrideTailwindcssPatcherOptionsForBase(
  options: TailwindCssPatchOptions | undefined,
  baseDir: string,
  cssEntries: string[],
): TailwindCssPatchOptions | undefined {
  const hasCssEntries = cssEntries.length > 0

  if (!options) {
    return options
  }

  const modernTailwind = options.tailwindcss
  if (!modernTailwind) {
    return options
  }

  return {
    ...options,
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
