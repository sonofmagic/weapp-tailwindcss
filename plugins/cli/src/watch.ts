import path from 'node:path'
import chokidar from 'chokidar'
import type { WatchOptions } from 'chokidar'
import defu from 'defu'
import { createContext } from 'weapp-tailwindcss/core'
import type { UserDefinedOptions } from 'weapp-tailwindcss'
import gulp from 'gulp'
import fs from 'fs-extra'
export interface CreateWatcherOptions {
  paths: string // | readonly string[]
  watchOptions: WatchOptions
  weappTailwindcssOptions: UserDefinedOptions
  outDir: string
}

export function createWatcher(options?: Partial<CreateWatcherOptions>) {
  const { paths, watchOptions, weappTailwindcssOptions, outDir } = defu<CreateWatcherOptions, Partial<CreateWatcherOptions>[]>(options, {
    paths: process.cwd(),
    watchOptions: {
      // persistent: false,
      // disableGlobbing: true,
      ignored: ['**/node_modules/**', '**/miniprogram_npm/**', '**/dist/**', /(^|[/\\])\../]
    },
    outDir: 'dist'
  })

  const { transformJs, transformWxml, transformWxss } = createContext(weappTailwindcssOptions)
}
