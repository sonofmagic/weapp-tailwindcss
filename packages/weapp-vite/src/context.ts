import process from 'node:process'
import type { EmittedFile, RollupWatcher } from 'rollup'
import type { FSWatcher } from 'chokidar'
import path from 'pathe'
import { getProjectConfig } from './utils/projectConfig'

export function createContext(cwd: string = process.cwd()) {
  const watcherCache = new Map< string | symbol, RollupWatcher | FSWatcher>()

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

  const projectConfig = getProjectConfig(cwd)

  return {
    watcherCache,
    isDev,
    assetCache,
    srcRootRef,
    relativeSrcRoot,
    cwd,
    projectConfig,
  }
}

export type Context = ReturnType<typeof createContext>
