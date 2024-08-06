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

export function getEntries(options: string | { cwd: string, relative?: boolean }) {
  let cwd: string
  let relative
  if (typeof options === 'string') {
    cwd = options
  }
  else {
    cwd = options.cwd
    relative = options.relative
  }

  const filter = createFilter(['**/*'], [...defaultExcluded, path.resolve(cwd, 'dist/**')], { cwd })
  return scanEntries(cwd, { filter, relative })
}
