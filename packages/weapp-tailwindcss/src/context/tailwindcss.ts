import type { TailwindcssUserConfig } from 'tailwindcss-patch'
import type { InternalUserDefinedOptions } from '@/types'
import { createTailwindcssPatcher } from '@/tailwindcss'
import { defuOverrideArray } from '@/utils'

export function createTailwindcssPatcherFromContext(ctx: InternalUserDefinedOptions) {
  const {
    tailwindcssBasedir,
    supportCustomLengthUnitsPatch,
    tailwindcss,
    tailwindcssPatcherOptions,
    cssEntries,
    appType,
  } = ctx

  return createTailwindcssPatcher(
    {
      basedir: tailwindcssBasedir,
      cacheDir: appType === 'mpx' ? 'node_modules/tailwindcss-patch/.cache' : undefined,
      supportCustomLengthUnitsPatch: supportCustomLengthUnitsPatch ?? true,
      tailwindcss: defuOverrideArray<TailwindcssUserConfig, TailwindcssUserConfig[]>(
        tailwindcss,
        {
          v4: {
            base: tailwindcssBasedir,
            cssEntries,
          },
        },
      ),
      tailwindcssPatcherOptions,
    },
  )
}
