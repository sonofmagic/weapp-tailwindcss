import type { EmittedFile, RollupWatcher } from 'rollup'
import type { FSWatcher } from 'chokidar'

export function createContext() {
  const watcherCache = new Map<string | symbol, RollupWatcher | FSWatcher>()

  const assetCache = new Map<string, EmittedFile>()

  const isDev: boolean = false
  return {
    watcherCache,
    isDev,
    assetCache,
  }
}

export type Context = ReturnType<typeof createContext>
