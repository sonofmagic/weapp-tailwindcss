import path from 'node:path'
import defu from 'defu'
import { createPlugins } from 'weapp-tailwindcss/gulp'
import type { UserDefinedOptions } from 'weapp-tailwindcss'
import gulp from 'gulp'

export interface CreateWatcherOptions {
  weappTailwindcssOptions: UserDefinedOptions
  outDir: string
}

export function createWatcher(options?: Partial<CreateWatcherOptions>) {
  const { paths, watchOptions, weappTailwindcssOptions, outDir } = defu<CreateWatcherOptions, Partial<CreateWatcherOptions>[]>(options, {
    outDir: 'dist'
  })

  const { transformJs, transformWxml, transformWxss } = createPlugins(weappTailwindcssOptions)
}
