import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import mm from 'micromatch'
import { defu } from '@weapp-core/shared'
import { defaultExcluded, scanEntries } from './utils'
import { vitePluginWeapp } from './plugins'

function createFilter(include: string[], exclude: string[], options?: mm.Options) {
  const opts = defu<mm.Options, mm.Options[]>(options, {
    ignore: exclude,
  })
  return function (id: unknown) {
    return mm.isMatch(id as string, include, opts)
  }
}

export async function runDev(cwd: string) {
  const filter = createFilter([], [...defaultExcluded, 'dist/**'], { cwd })
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
        watch: {
          chokidar: {
            persistent: true,
          },
        },
        minify: false,
      },
    })) as RollupWatcher

    watcher.on('change', (id, change) => {
      console.log(id, change)
    })

    return watcher
  }
}

export async function runProd(cwd: string) {
  const filter = createFilter([], [...defaultExcluded, 'dist/**'], { cwd })
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
