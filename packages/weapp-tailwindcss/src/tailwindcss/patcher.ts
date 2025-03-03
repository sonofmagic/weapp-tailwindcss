import type { CacheOptions, ILengthUnitsPatchOptions, TailwindcssPatcherOptions, TailwindcssUserConfig } from 'tailwindcss-patch'
import path from 'node:path'
import process from 'node:process'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { TailwindcssPatcher } from 'tailwindcss-patch'

export interface CreateTailwindcssPatcherOptions {
  basedir?: string
  cacheDir?: string
  supportCustomLengthUnitsPatch?: boolean | ILengthUnitsPatchOptions
  tailwindcss?: TailwindcssUserConfig
  tailwindcssPatcherOptions?: TailwindcssPatcherOptions
}

export function createTailwindcssPatcher(options?: CreateTailwindcssPatcherOptions) {
  const { basedir, cacheDir, supportCustomLengthUnitsPatch, tailwindcss, tailwindcssPatcherOptions } = options || {}
  const cache: CacheOptions = {}

  if (cacheDir) {
    if (path.isAbsolute(cacheDir)) {
      cache.dir = cacheDir
    }
    else if (basedir) {
      cache.dir = path.resolve(basedir, cacheDir)
    }
    else {
      cache.dir = path.resolve(process.cwd(), cacheDir)
    }
  }

  return new TailwindcssPatcher(defuOverrideArray<TailwindcssPatcherOptions, TailwindcssPatcherOptions[]>(
    tailwindcssPatcherOptions!,
    {
      cache,
      patch: {
        basedir,
        applyPatches: {
          exportContext: true,
          extendLengthUnits: supportCustomLengthUnitsPatch,
        },
        tailwindcss,
        resolve: {
          paths: [
            import.meta.url,
          ],
        },
      },
    },
  ))
}
