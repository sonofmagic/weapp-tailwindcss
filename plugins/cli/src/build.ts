import path from 'node:path'
import defu from 'defu'
import { FSWatcher, ensureDirSync } from 'fs-extra'
import gulp from 'gulp'
import loadPostcssConfig from 'postcss-load-config'
import type { Result } from 'postcss-load-config'
import pc from 'picocolors'
import { getPackageInfo } from 'local-pkg'
import { version } from '../package.json'
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

export async function createBuilder(options?: Partial<BuildOptions>) {
  let postcssOptionsFromConfig: Result | undefined
  try {
    postcssOptionsFromConfig = await loadPostcssConfig({ cwd: options?.root })
  } catch {}
  const opt = defu<BuildOptions, Partial<BuildOptions>[]>(options, {
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
    },
    postcssOptions: postcssOptionsFromConfig
  })

  const { copyOthers, getCssTasks, getHtmlTasks, getJsTasks, getJsonTasks, globsSet } = await getTasks(opt)

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
      if (value) {
        debug(`run task ${pc.bold(pc.green(key))} start`)
        for (const task of value) {
          await task()
        }
        debug(`run task ${pc.bold(pc.green(key))} end`)
      }
    }
    debug('run tasks end')
  }
  const { clean, outDir, root: cwd, watchOptions } = opt
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

      const watcher = gulp.watch(globsSet.dump(), watchOptions, async (cb) => {
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

      watcher.on('ready', async function () {
        const meta = await getPackageInfo('weapp-tailwindcss')
        let weappTwVersionStr: string = ''
        if (meta) {
          weappTwVersionStr = `(${pc.blue(pc.underline(meta.version))})`
        }

        console.log(`${pc.bold(`${pc.green('weapp')}-${pc.blue('tailwindcss')}`)}${weappTwVersionStr} ${pc.cyan('cli')}(${pc.blue(pc.underline(version))}) is ready!`)
      })
      this.watcher = watcher
      return this
    },
    globsSet
  }
}

export async function build(options?: Partial<BuildOptions>) {
  const builder = await createBuilder(options)
  return await builder.build()
}

export async function watch(options?: Partial<BuildOptions>) {
  const builder = await createBuilder(options)
  return await builder.watch()
}
