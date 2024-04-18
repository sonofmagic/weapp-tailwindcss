import path from 'node:path'
import type { Transform } from 'node:stream'
import defu from 'defu'
import { createPlugins } from 'weapp-tailwindcss/gulp'
import type { UserDefinedOptions } from 'weapp-tailwindcss'
import gulp from 'gulp'

export interface CreateWatcherOptions {
  weappTailwindcssOptions: UserDefinedOptions
  outDir: string
  cwd: string
}

function promisify(task: Transform) {
  return new Promise((resolve, reject) => {
    if (task.destroyed) {
      resolve(undefined)
      return
    }
    task.on('finish', resolve).on('error', reject)
  })
}

export function createWatcher(options?: Partial<CreateWatcherOptions>) {
  const { cwd, weappTailwindcssOptions, outDir } = defu<CreateWatcherOptions, Partial<CreateWatcherOptions>[]>(options, {
    outDir: 'dist',
    weappTailwindcssOptions: {}
  })

  const { transformJs, transformWxml, transformWxss } = createPlugins(weappTailwindcssOptions)

  gulp
    .src(['**/*.{js,ts,json,css,wxss,wxml}', '!dist/**/*', '!node_modules/**/*', '!miniprogram_npm/**/*'], {
      cwd
    })
    .pipe(
      gulp.dest('./dist', {
        cwd
      })
    )
}
