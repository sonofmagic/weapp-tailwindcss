import process from 'node:process'
import mm from 'micromatch'
import { defu } from '@weapp-core/shared'
import path from 'pathe'
import { defaultExcluded, scanEntries } from './utils'

export function createFilter(include: string[], exclude: string[], options?: mm.Options) {
  const opts = defu<mm.Options, mm.Options[]>(options, {
    ignore: exclude,
    // dot: true,
    // contains: true,
  })
  return function (id: unknown | string) {
    if (typeof id !== 'string') {
      return false
    }
    if (/\0/.test(id)) {
      return false
    }

    return mm.isMatch(id as string, include, opts)
  }
}

export function getEntries(options: { root?: string, srcRoot?: string, outDir?: string, relative?: boolean }) {
  // build.outDir
  const { root = process.cwd(), outDir = 'dist', relative, srcRoot = '' } = options
  const filter = createFilter(
    [path.join(srcRoot, '**/*')],
    [...defaultExcluded, path.join(root, `${outDir}/**`)],
    { cwd: root },
  )
  return scanEntries(root, { filter, relative })
}
