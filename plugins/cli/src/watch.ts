import path from 'node:path'
import chokidar from 'chokidar'
import type { WatchOptions } from 'chokidar'
import defu from 'defu'
import { createContext } from 'weapp-tailwindcss/core'
import type { UserDefinedOptions } from 'weapp-tailwindcss'
import fs from 'fs-extra'
export interface CreateWatcherOptions {
  paths: string | readonly string[]
  watchOptions: WatchOptions
  weappTailwindcssOptions: UserDefinedOptions
  outDir: string
}

export function createWatcher(options?: Partial<CreateWatcherOptions>) {
  const { paths, watchOptions, weappTailwindcssOptions, outDir } = defu<CreateWatcherOptions, Partial<CreateWatcherOptions>[]>(options, {
    paths: '.',
    watchOptions: {
      // persistent: false,
      disableGlobbing: true,
      ignored: ['**/node_modules/**', '**/miniprogram_npm/**', '**/dist/**', /(^|[/\\])\../]
    },
    outDir: 'dist'
  })
  const { transformJs, transformWxml, transformWxss } = createContext(weappTailwindcssOptions)
  const watcher = chokidar.watch(paths, watchOptions)
  chokidar.watch(paths, watchOptions).on('all', (event, path, stats) => {
    console.log(event, path)
    switch (event) {
      case 'add': {
        break
      }
      case 'addDir': {
        break
      }
      case 'change': {
        break
      }
      case 'unlink': {
        break
      }
      case 'unlinkDir': {
        break
      }

      // No default
    }
    // sitemap.json
  })
  // watcher.add('./**/*')
  return watcher
}
