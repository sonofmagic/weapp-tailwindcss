import path from 'node:path'
import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import { createFilter } from '@rollup/pluginutils'
import { defaultExcluded, scanEntries } from './utils'
import { vitePluginWeapp } from './plugins'

export async function runDev(cwd: string) {
  const filter = createFilter([], [...defaultExcluded, path.resolve(cwd, 'dist/**')])
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

    return watcher
  }
}

export async function runProd(cwd: string) {
  const filter = createFilter([], [...defaultExcluded, path.resolve(cwd, 'dist/**')])
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
