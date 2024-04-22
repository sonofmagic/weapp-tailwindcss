import path from 'node:path'
import defu from 'defu'
import { FSWatcher, ensureDirSync } from 'fs-extra'
import gulp from 'gulp'
import type { BuildOptions } from '@/type'
import { getTasks } from '@/task'

const defaultJavascriptExtensions = ['js'] //, 'cjs', 'mjs']

const defaultTypescriptExtensions = ['ts'] //, 'cts', 'mts']

const defaultWxsExtensions = ['wxs']

const defaultNodeModulesDirs = [
  '**/node_modules/**',
  '**/miniprogram_npm/**',
  '**/project.config.json/**',
  '**/project.private.config.json/**',
  '**/package.json/**',
  'postcss.config.js',
  'tailwind.config.js'
]

export function createBuilder(options?: Partial<BuildOptions>) {
  const {
    root: cwd,
    weappTailwindcssOptions,
    outDir,
    src: srcBase,
    clean,
    extensions,
    exclude,
    include,
    watchOptions
  } = defu<BuildOptions, Partial<BuildOptions>[]>(options, {
    outDir: 'dist',
    weappTailwindcssOptions: {},
    clean: true,
    src: '',
    exclude: [...defaultNodeModulesDirs],
    extensions: {
      javascript: [...defaultJavascriptExtensions, ...defaultTypescriptExtensions, ...defaultWxsExtensions],
      html: ['wxml'],
      css: ['wxss', 'less', 'sass', 'scss'],
      json: ['json']
    }
  })

  const { copyOthers, getCssTasks, getHtmlTasks, getJsTasks, getJsonTasks, globsSet } = getTasks({
    root: cwd,
    weappTailwindcssOptions,
    outDir,
    src: srcBase,
    clean,
    extensions,
    exclude,
    include,
    watchOptions
  })

  const tasks = [...getJsTasks(), ...getJsonTasks(), ...getCssTasks(), ...getHtmlTasks(), copyOthers]

  return {
    watcher: <FSWatcher | undefined>undefined,
    async build() {
      if (clean) {
        const { deleteAsync } = await import('del')
        const patterns = [outDir + '/**']
        await deleteAsync(patterns, { cwd, ignore: defaultNodeModulesDirs })
      }
      ensureDirSync(path.resolve(cwd, outDir))
      for (const task of tasks) {
        const s = task()
        if (s) {
          await new Promise((resolve, reject) => s.on('finish', resolve).on('error', reject))
        }
      }
      return this
    },
    watch() {
      ensureDirSync(path.resolve(cwd, outDir))
      const watcher = gulp.watch([...globsSet], watchOptions, gulp.parallel(...tasks))
      watcher.on('change', function (path) {
        console.log(`File ${path} was changed`)
      })

      watcher.on('add', function (path) {
        console.log(`File ${path} was added`)
      })

      watcher.on('unlink', function (path) {
        console.log(`File ${path} was removed`)
      })
      this.watcher = watcher
      return this
    },
    globsSet
  }
}

export function build(options?: Partial<BuildOptions>) {
  const builder = createBuilder(options)
  return builder.build()
}

export function watch(options?: Partial<BuildOptions>) {
  const builder = createBuilder(options)
  return builder.watch()
}
