import type { Transform } from 'node:stream'
import path from 'node:path'
import defu from 'defu'
import { createPlugins } from 'weapp-tailwindcss/gulp'
import type { UserDefinedOptions } from 'weapp-tailwindcss'
import vfs from 'vinyl-fs'
import { ensureDir } from 'fs-extra'

export enum AssetType {
  // wxs is JavaScript
  // TypeScript is JavaScript = 'typescript',
  JavaScript = 'javascript',
  Json = 'json',
  Css = 'css',
  Html = 'html'

  // Less = 'less',
  // Sass = 'sass',
  // Scss = 'scss'
}

export interface BuildOptions {
  weappTailwindcssOptions: UserDefinedOptions
  outDir: string
  root: string
  clean: boolean
  src: string
  exclude: string[] | ((type: AssetType) => string[])
  include: string[] | ((type: AssetType) => string[])
  extensions: {
    javascript: string[]
    html: string[]
    css: string[]
    json: string[]
  }
}
// typescript?: string[]

export function promisify(task: Transform | Transform[]) {
  return new Promise((resolve, reject) => {
    if (Array.isArray(task)) {
      Promise.all(task.map((x) => promisify(x)))
        .then(resolve)
        .catch(reject)
    } else {
      if (task.destroyed) {
        resolve(undefined)
        return
      }
      task.on('finish', resolve).on('error', reject)
    }
  })
}

const defaultJavascriptExtensions = ['js'] //, 'cjs', 'mjs']

const defaultTypescriptExtensions = ['ts'] //, 'cts', 'mts']

const defaultWxsExtensions = ['wxs']

const defaultNodeModulesDirs = ['**/node_modules/**', '**/miniprogram_npm/**', '**/project.config.json/**', '**/project.private.config.json/**', '**/package.json/**']

export async function build(options?: Partial<BuildOptions>) {
  const {
    root: cwd,
    weappTailwindcssOptions,
    outDir,
    src: srcBase,
    clean,
    extensions,
    exclude,
    include
  } = defu<BuildOptions, Partial<BuildOptions>[]>(options, {
    outDir: 'dist',
    weappTailwindcssOptions: {},
    clean: true,
    src: '',
    exclude: [...defaultNodeModulesDirs],
    extensions: {
      javascript: [...defaultJavascriptExtensions, ...defaultTypescriptExtensions, ...defaultWxsExtensions],
      html: ['wxml'],
      css: ['wxss'], //  'less', 'sass', 'scss'],
      json: ['json']
    }
  })

  if (clean) {
    const { deleteAsync } = await import('del')
    const patterns = [outDir, ...defaultNodeModulesDirs.map((x) => '!' + x)]
    await deleteAsync(patterns, { cwd })
  }

  await ensureDir(path.resolve(cwd, outDir))
  const base = srcBase ? srcBase + '/' : ''
  function getGlobs(type: AssetType) {
    const globs: string[] = []
    if (typeof include === 'function') {
      globs.push(...include(type).map((x) => x))
    }
    if (typeof exclude === 'function') {
      globs.push(...exclude(type).map((x) => '!' + x))
    } else if (Array.isArray(exclude)) {
      globs.push(...exclude.map((x) => '!' + x))
    }
    globs.push(`!${outDir}/**/*`)
    return globs
  }

  const { transformJs, transformWxml, transformWxss } = createPlugins(weappTailwindcssOptions)

  function getJsTasks() {
    const assetType = AssetType.JavaScript
    const globs = getGlobs(assetType)
    return extensions[assetType].map((x) => {
      return () =>
        vfs
          .src([`${base}**/*.${x}`, ...globs], { cwd })
          .pipe(
            transformJs({
              babelParserOptions:
                x === 'ts'
                  ? {
                      plugins: ['typescript']
                    }
                  : undefined
            })
          )
          .pipe(
            vfs.dest(outDir, {
              cwd
            })
          )
    })
  }

  function getJsonTasks() {
    const assetType = AssetType.Json
    const globs = getGlobs(assetType)
    return extensions[assetType].map((x) => {
      return () =>
        vfs.src([`${base}**/*.${x}`, ...globs], { cwd }).pipe(
          vfs.dest(outDir, {
            cwd
          })
        )
    })
  }

  function getCssTasks() {
    const assetType = AssetType.Css
    const globs = getGlobs(assetType)
    return extensions[assetType].map((x) => {
      return () =>
        vfs
          .src([`${base}**/*.${x}`, ...globs], { cwd })
          .pipe(transformWxss())
          .pipe(
            vfs.dest(outDir, {
              cwd
            })
          )
    })
  }

  function getHtmlTasks() {
    const assetType = AssetType.Html
    const globs = getGlobs(assetType)
    return extensions[assetType].map((x) => {
      return () =>
        vfs
          .src([`${base}**/*.${x}`, ...globs], { cwd })
          .pipe(transformWxml())
          .pipe(
            vfs.dest(outDir, {
              cwd
            })
          )
    })
  }

  function copyOthers() {
    if (Array.isArray(include)) {
      return vfs
        .src(
          include.map((x) => {
            return `${base}${x}`
          }),
          { cwd }
        )
        .pipe(
          vfs.dest(outDir, {
            cwd
          })
        )
    }
  }
  // ...getJsTasks(), ,
  const tasks = [...getJsTasks(), ...getJsonTasks(), ...getCssTasks(), ...getHtmlTasks(), copyOthers]
  for (const task of tasks) {
    const s = task()
    if (s) {
      await new Promise((resolve, reject) => s.on('finish', resolve).on('error', reject))
    }
  }

  // const parallelTask = vfs.parallel(...tasks)

  // return await new Promise((resolve, reject) => {
  //   parallelTask((err) => {
  //     if (err) {
  //       reject(err)
  //       return
  //     }
  //     resolve(undefined)
  //   })
  // })
}
