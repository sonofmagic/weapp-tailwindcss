import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import mm from 'micromatch'
import { defu } from '@weapp-core/shared'
import path from 'pathe'
import { defaultExcluded, scanEntries } from './utils'
import { vitePluginWeapp } from './plugins'

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

export async function runDev(cwd: string) {
  const filter = createFilter(['**/*'], [...defaultExcluded, path.resolve(cwd, 'dist/**')], { cwd })
  const entries = await scanEntries(cwd, { filter })

  if (entries) {
    const watcher = (await build({
      plugins: [
        vitePluginWeapp({
          cwd,
          entries: entries.all,
        }),
      ],
      build: {
        watch: {},
        minify: false,
      },
    })) as RollupWatcher

    // watcher.on('event', (event) => {
    //   console.log(event)
    // })

    return watcher
  }
}

export async function runProd(cwd: string) {
  const filter = createFilter(['**/*'], [...defaultExcluded, path.resolve(cwd, 'dist/**')], { cwd })
  const entries = await scanEntries(cwd, { filter })

  if (entries) {
    const output = (await build({
      plugins: [
        vitePluginWeapp({
          cwd,
          entries: entries.all,
        }),
      ],
    })) as RollupOutput | RollupOutput[]

    return output
  }
}
