import type { RollupWatcher } from 'rollup'

export function createContext() {
  const watcherCache = new Map<string | symbol, RollupWatcher>()

  return {
    watcherCache,
  }
}

export type Context = ReturnType<typeof createContext>
