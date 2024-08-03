import path from 'node:path'
import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import { createFilter } from '@rollup/pluginutils'
import { defaultExcluded, scanEntries } from './utils'
import { vitePluginWeapp } from './plugins'

export async function runDev(cwd: string) {
  const filter = createFilter([], [...defaultExcluded, path.resolve(cwd, 'dist/**')])
  const entries = await scanEntries(cwd, { filter })

  function relative(p: string) {
    return path.relative(cwd, p)
  }

  if (entries) {
    const allEntries = [entries.app, ...entries.pages, ...entries.components]
    const allSet = new Set<string>(allEntries)
    const input = allEntries
      .reduce<Record<string, string>>((acc, cur) => {
        acc[relative(cur)] = cur
        return acc
      }, {})

    const watcher = (await build({
      plugins: [
        vitePluginWeapp({
          cwd,
          entries: allSet,
        }),
      ],
      build: {
        watch: {
          chokidar: {
            persistent: true,
          },
        },
        assetsDir: '.',
        rollupOptions: {
          input,
          output: {
            format: 'cjs',
            entryFileNames: (chunkInfo) => {
              return chunkInfo.name
            },
          },
        },
        minify: false,
        commonjsOptions: {
          transformMixedEsModules: true,
        },

      },
    })) as RollupWatcher

    return watcher
  }
}

export async function runProd(_cwd: string) {
  const output = (await build({
    build: {

    },
  })) as RollupOutput | RollupOutput[]

  return output
}
