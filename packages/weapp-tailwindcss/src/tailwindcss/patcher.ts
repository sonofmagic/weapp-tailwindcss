import path from 'node:path'
import process from 'node:process'
import type { CacheOptions } from 'tailwindcss-patch'
import { TailwindcssPatcher, requireResolve } from 'tailwindcss-patch'
import type { ILengthUnitsPatchDangerousOptions, ILengthUnitsPatchOptions } from '@/types'

export function getInstalledPkgJsonPath(options: ILengthUnitsPatchOptions) {
  const dangerousOptions = options.dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  try {
    const tmpJsonPath = requireResolve(`${dangerousOptions.packageName}/package.json`, {
      paths: options.paths,
      basedir: options.basedir,
    })

    return tmpJsonPath
  }
  catch (error) {
    if ((<Error & { code: string }>error).code === 'MODULE_NOT_FOUND') {
      console.warn(
        '没有找到`tailwindcss`包，请确认是否安装。想要禁用打上rpx支持patch或者非`tailwindcss`框架，你可以设置 `supportCustomLengthUnitsPatch` 为 false',
      )
    }
  }
}

export function createTailwindcssPatcher(basedir?: string, cacheDir?: string) {
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
        extendLengthUnits: true,
      },
    },
  })
}
