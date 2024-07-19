import path from 'node:path'
import process from 'node:process'
import type { CacheOptions, ILengthUnitsPatchOptions } from 'tailwindcss-patch'
import { TailwindcssPatcher } from 'tailwindcss-patch'

export function createTailwindcssPatcher(basedir?: string, cacheDir?: string, supportCustomLengthUnitsPatch?: boolean | ILengthUnitsPatchOptions) {
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
    },
  })
}
