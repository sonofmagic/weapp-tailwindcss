import path from 'node:path'
import defu from 'defu'
import { FSWatcher, ensureDirSync } from 'fs-extra'
import gulp from 'gulp'
import loadPostcssConfig from 'postcss-load-config'
import type { Result } from 'postcss-load-config'
import pc from 'picocolors'
import { debug } from './debug'
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
    watchOptions,
    postcssOptions
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
    },
    watchOptions: {
      events: ['add', 'change', 'unlink', 'ready']
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
    watchOptions,
    postcssOptions
  })

  const tasks = {
    css: getCssTasks(),
    html: getHtmlTasks(),
    json: getJsonTasks(),
    js: getJsTasks(),
    extra: [copyOthers]
  }

  async function runTasks() {
    debug('run tasks start')
    for (const [key, value] of Object.entries(tasks)) {
      debug(`run task ${pc.bold(pc.green(key))} start`)
      for (const task of value) {
        const s = task()
        if (s) {
          await new Promise((resolve, reject) => s.on('finish', resolve).on('error', reject))
        }
      }
      debug(`run task ${pc.bold(pc.green(key))} end`)
    }
    debug('run tasks end')
  }

  return {
    watcher: <FSWatcher | undefined>undefined,
    async build() {
      if (clean) {
        debug('del start')
        const { deleteAsync } = await import('del')
        const patterns = [outDir + '/**']
        await deleteAsync(patterns, { cwd, ignore: defaultNodeModulesDirs })
        debug('del end')
      }
      ensureDirSync(path.resolve(cwd, outDir))
      await runTasks()
      return this
    },
    watch() {
      ensureDirSync(path.resolve(cwd, outDir))

      const watcher = gulp.watch([...globsSet], watchOptions, async (cb) => {
        try {
          await runTasks()
          cb()
        } catch (error) {
          cb(error as Error)
        }
      })
      watcher.on('change', function (path) {
        console.log(`${pc.green('changed')} ${path}`)
      })

      watcher.on('add', function (path) {
        console.log(`${pc.green('add')} ${path}`)
      })

      watcher.on('unlink', function (path) {
        console.log(`${pc.green('remove')} ${path}`)
      })

      watcher.on('ready', function () {
        console.log(`${pc.green('weapp')}-${pc.blue('tailwindcss')} is ready!`)
      })
      this.watcher = watcher
      return this
    },
    globsSet
  }
}

export async function build(options?: Partial<BuildOptions>) {
  let postcssOptions: Result | undefined
  try {
    postcssOptions = await loadPostcssConfig({ cwd: options?.root })
  } catch {}

  const builder = createBuilder(defu<BuildOptions, Partial<BuildOptions>[]>(options, { postcssOptions }))
  return await builder.build()
}

export async function watch(options?: Partial<BuildOptions>) {
  let postcssOptions: Result | undefined
  try {
    postcssOptions = await loadPostcssConfig({ cwd: options?.root })
  } catch {}
  const builder = createBuilder(defu<BuildOptions, Partial<BuildOptions>[]>(options, { postcssOptions }))
  return await builder.watch()
}
