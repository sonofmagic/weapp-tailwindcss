import type { Transform } from 'node:stream'
import { createPlugins } from 'weapp-tailwindcss/gulp'
import gulp from 'gulp'
import { AssetType } from '@/enum'
import type { BuildOptions } from '@/type'

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

export function getTasks(options: BuildOptions) {
  const { root: cwd, weappTailwindcssOptions, outDir, src: srcBase, extensions, exclude, include } = options
  const globsSet = new Set<string>()
  const base = srcBase ? srcBase + '/' : ''

  function globsSetAdd(...value: string[] | string[][]) {
    for (const v of value) {
      if (Array.isArray(v)) {
        for (const vv of v) {
          globsSet.add(vv)
        }
      } else {
        globsSet.add(v)
      }
    }
  }
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
    globsSetAdd(globs)
    return extensions[assetType].map((x) => {
      const src = `${base}**/*.${x}`
      globsSetAdd(src)
      return () =>
        gulp
          .src([src, ...globs], { cwd })
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
            gulp.dest(outDir, {
              cwd
            })
          )
    })
  }

  function getJsonTasks() {
    const assetType = AssetType.Json
    const globs = getGlobs(assetType)
    globsSetAdd(globs)
    return extensions[assetType].map((x) => {
      const src = `${base}**/*.${x}`
      globsSetAdd(src)
      return () =>
        gulp.src([src, ...globs], { cwd }).pipe(
          gulp.dest(outDir, {
            cwd
          })
        )
    })
  }

  function getCssTasks() {
    const assetType = AssetType.Css
    const globs = getGlobs(assetType)
    globsSetAdd(globs)
    return extensions[assetType].map((x) => {
      const src = `${base}**/*.${x}`
      globsSetAdd(src)
      return () =>
        gulp
          .src([src, ...globs], { cwd })
          .pipe(transformWxss())
          .pipe(
            gulp.dest(outDir, {
              cwd
            })
          )
    })
  }

  function getHtmlTasks() {
    const assetType = AssetType.Html
    const globs = getGlobs(assetType)
    globsSetAdd(globs)
    return extensions[assetType].map((x) => {
      const src = `${base}**/*.${x}`
      globsSetAdd(src)
      return () =>
        gulp
          .src([src, ...globs], { cwd })
          .pipe(transformWxml())
          .pipe(
            gulp.dest(outDir, {
              cwd
            })
          )
    })
  }

  function copyOthers() {
    if (Array.isArray(include)) {
      const globs = include.map((x) => {
        return `${base}${x}`
      })
      globsSetAdd(globs)
      return gulp.src(globs, { cwd }).pipe(
        gulp.dest(outDir, {
          cwd
        })
      )
    }
  }

  return {
    getGlobs,
    getJsTasks,
    getJsonTasks,
    getCssTasks,
    getHtmlTasks,
    copyOthers,
    globsSet
  }
}
