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

  const defaultTailwindcssConfig: TailwindcssUserConfig = {
    v4: {
      base: tailwindcssBasedir,
      cssEntries,
    },
  }

  if (cssEntries?.length && (tailwindcss == null || tailwindcss.version == null)) {
    defaultTailwindcssConfig.version = 4
  }

  return createTailwindcssPatcher(
    {
      basedir: tailwindcssBasedir,
      cacheDir: appType === 'mpx' ? 'node_modules/tailwindcss-patch/.cache' : undefined,
      supportCustomLengthUnitsPatch: supportCustomLengthUnitsPatch ?? true,
      tailwindcss: defuOverrideArray<TailwindcssUserConfig, TailwindcssUserConfig[]>(
        tailwindcss,
        defaultTailwindcssConfig,
      ),
      tailwindcssPatcherOptions,
    },
  )
}
