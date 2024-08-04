import type { InlineConfig } from 'vite'
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

export async function runDev(cwd: string, options?: InlineConfig) {
  const entries = await getEntries(cwd)

  if (entries) {
    const watcher = (await build(
      defu(
        options,
        {
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
        },
      )
      ,
    )) as RollupWatcher

    // watcher.on('event', (event) => {
    //   console.log(event)
    // })

    return watcher
  }
}

export async function runProd(cwd: string, options?: InlineConfig) {
  const entries = await getEntries(cwd)

  if (entries) {
    const output = (await build(
      defu(
        options,
        {
          plugins: [
            vitePluginWeapp({
              cwd,
              entries: entries.all,
            }),
          ],
        },
      ),
    )) as RollupOutput | RollupOutput[]

    return output
  }
}
