import path from 'node:path'
import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import { scanEntries } from './utils'

export async function runDev(cwd: string) {
  const entries = await scanEntries(cwd)
  if (entries) {
    const input = [entries.app, ...entries.pages, ...entries.components, ...entries.css]
      .reduce<Record<string, string>>((acc, cur) => {
        acc[path.relative(cwd, cur)] = cur
        return acc
      }, {})
    const watcher = (await build({
      plugins: [
        // {
        //   enforce: 'pre',
        //   resolveId(source, importer, options) {
        //     console.log(source, importer, options)
        //     if (/\.wxss$/.test(source)) {
        //       return {
        //         id: 'app.css',
        //       }
        //     }
        //   },
        // },
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
            entryFileNames: (_chunkInfo) => {
              return '[name]'
            },
            // chunkFileNames: '[name].js',
          },
        },
        minify: false,
        commonjsOptions: {
          // include:[]
        },

      },
    })) as RollupWatcher

    return watcher
  }
}

export async function runProd(_cwd: string) {
  // const entries = await scanEntries(cwd)
  const output = (await build({
    build: {

    },
  })) as RollupOutput | RollupOutput[]

  return output
}
