import process from 'node:process'
import type { EmittedFile, RollupWatcher } from 'rollup'
import type { FSWatcher } from 'chokidar'
import path from 'pathe'
import { getProjectConfig } from './utils/projectConfig'

export function createContext(cwd: string = process.cwd(), options?: { mode?: string }) {
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

  const projectConfig = getProjectConfig(cwd)

  const mpRoot = projectConfig.miniprogramRoot || projectConfig.srcMiniprogramRoot

  return {
    options: options ?? {},
    watcherCache,
    isDev,
    assetCache,
    srcRootRef,
    relativeSrcRoot,
    cwd,
    projectConfig,
    mpRoot,
  }
}

export type Context = ReturnType<typeof createContext>
