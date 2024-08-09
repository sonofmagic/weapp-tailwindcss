import type { RollupWatcher } from 'rollup'

export function createContext() {
  const watcherCache = new Map<string | symbol, RollupWatcher>()
  const isDev: boolean = false
  return {
    watcherCache,
    isDev,
  }
}

export type Context = ReturnType<typeof createContext>
