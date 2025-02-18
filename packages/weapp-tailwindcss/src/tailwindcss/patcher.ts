import type { PackageResolvingOptions } from 'local-pkg'
import type { CacheOptions, ILengthUnitsPatchOptions, TailwindcssUserConfig } from 'tailwindcss-patch'
import path from 'node:path'
import process from 'node:process'
import { isAllowedClassName } from '@weapp-core/escape'
import { TailwindcssPatcher } from 'tailwindcss-patch'

export interface CreateTailwindcssPatcherOptions {
  basedir?: string
  cacheDir?: string
  supportCustomLengthUnitsPatch?: boolean | ILengthUnitsPatchOptions
  tailwindcss?: TailwindcssUserConfig
  resolve?: PackageResolvingOptions
}

export function createTailwindcssPatcher(options?: CreateTailwindcssPatcherOptions) {
  const { basedir, cacheDir, supportCustomLengthUnitsPatch, tailwindcss, resolve } = options || {}
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

  return new TailwindcssPatcher({
    cache,
    patch: {
      basedir,
      applyPatches: {
        exportContext: true,
        extendLengthUnits: supportCustomLengthUnitsPatch,
      },
      tailwindcss,
      resolve,
      filter: (x) => {
        return !isAllowedClassName(x)
      },
      // for example
      // resolve: {
      //   paths: [
      //     import.meta.url,
      //   ],
      // },
    },
  })
}
