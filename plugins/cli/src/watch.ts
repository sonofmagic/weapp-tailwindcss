import chokidar from 'chokidar'
import type { WatchOptions } from 'chokidar'
import defu from 'defu'
import { createContext } from 'weapp-tailwindcss/core'
import type { UserDefinedOptions } from 'weapp-tailwindcss'

export interface CreateWatcherOptions {
  paths: string | readonly string[]
  watchOptions: WatchOptions
  weappTailwindcssOptions: UserDefinedOptions
}

export function createWatcher(options?: Partial<CreateWatcherOptions>) {
  const { paths, watchOptions, weappTailwindcssOptions } = defu<CreateWatcherOptions, Partial<CreateWatcherOptions>[]>(options, {
    paths: '.',
    watchOptions: {
      ignored: ['node_modules']
    }
  })
  const { transformJs, transformWxml, transformWxss } = createContext(weappTailwindcssOptions)
  return chokidar.watch(paths, watchOptions).on('all', (event, path, stats) => {
    console.log(event, path)
  })
}
