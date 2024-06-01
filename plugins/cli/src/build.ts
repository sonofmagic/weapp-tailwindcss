import path from 'node:path'
import defu from 'defu'
import type { FSWatcher } from 'fs-extra'
import { ensureDirSync } from 'fs-extra'
import gulp from 'gulp'
import loadPostcssConfig from 'postcss-load-config'
import type { Result } from 'postcss-load-config'
import pc from 'picocolors'
import { getPackageInfo } from 'local-pkg'
// import type { Matcher } from 'anymatch'
import { version } from '../package.json'
import { debug } from '@/debug'
import { defaultNodeModulesDirs, getDefaultOptions } from '@/defaults'
import type { BuildOptions } from '@/type'
import { getTasks } from '@/task'

export async function createBuilder(options?: Partial<BuildOptions>) {
  let postcssOptionsFromConfig: Result | undefined
  try {
    postcssOptionsFromConfig = await loadPostcssConfig({ cwd: options?.root })
  }
  catch { }
  const opt = defu<BuildOptions, Partial<BuildOptions>[]>(options, getDefaultOptions(options, postcssOptionsFromConfig))

  const { copyOthers, getCssTasks, getHtmlTasks, getJsTasks, getJsonTasks, globsSet } = await getTasks(opt)

  const tasks = {
    css: getCssTasks(),
    html: getHtmlTasks(),
    json: getJsonTasks(),
    js: getJsTasks(),
    extra: [copyOthers],
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
        const patterns = [`${outDir}/**`]
        await deleteAsync(patterns, { cwd, ignore: defaultNodeModulesDirs })
        debug('del end')
      }
      ensureDirSync(path.resolve(cwd, outDir))
      await runTasks()
      return this
    },
    watch() {
      ensureDirSync(path.resolve(cwd, outDir))
      const dumps = globsSet.dump()
      const arr = (Array.isArray(watchOptions.ignored) ? watchOptions.ignored : [watchOptions.ignored]).filter(
        Boolean,
      ) as string[]
      watchOptions.ignored = [...globsSet.dumpIgnored(), ...arr]

      const watcher = gulp.watch(dumps, watchOptions, async (cb) => {
        try {
          await runTasks()
          cb()
        }
        catch (error) {
          cb(error as Error)
        }
      })
      watcher.on('change', (path) => {
        console.log(`${pc.green('changed')} ${path}`)
      })

      watcher.on('add', (path) => {
        console.log(`${pc.green('add')} ${path}`)
      })

      watcher.on('unlink', (path) => {
        console.log(`${pc.green('remove')} ${path}`)
      })

      watcher.on('ready', async () => {
        const meta = await getPackageInfo('weapp-tailwindcss')
        let weappTwVersionStr: string = ''
        if (meta) {
          weappTwVersionStr = `(${pc.blue(pc.underline(meta.version))})`
        }

        console.log(
          `${pc.bold(`${pc.green('weapp')}-${pc.blue('tailwindcss')}`)}${weappTwVersionStr} ${pc.cyan('cli')}(${pc.blue(pc.underline(version))}) is ready!`,
        )
      })
      this.watcher = watcher
      return this
    },
    globsSet,
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
