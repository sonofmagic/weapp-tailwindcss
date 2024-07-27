import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'

export async function runDev() {
  const watcher = (await build({
    build: {
      watch: {
        chokidar: {
          persistent: true,
        },
      },
      rollupOptions: {

      },
    },
  })) as RollupWatcher

  return watcher
}

export async function runProd() {
  const output = (await build({
    build: {

    },
  })) as RollupOutput | RollupOutput[]

  return output
}
