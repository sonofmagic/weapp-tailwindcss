import type { EmittedFile, RollupWatcher } from 'rollup'
import type { FSWatcher } from 'chokidar'
import path from 'pathe'

export function createContext() {
  const watcherCache = new Map<string | symbol, RollupWatcher | FSWatcher>()

  const assetCache = new Map<string, EmittedFile>()

  const isDev: boolean = false
  const srcRootRef = {
    value: '',
  }

  function relativeSrcRoot(p: string) {
    if (srcRootRef.value) {
      return path.relative(srcRootRef.value, p)
    }
    return p
  }

  return {
    watcherCache,
    isDev,
    assetCache,
    srcRootRef,
    relativeSrcRoot,
  }
}

export type Context = ReturnType<typeof createContext>
