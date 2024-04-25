import type { Transform } from 'node:stream'
import { createPlugins } from 'weapp-tailwindcss/gulp'
import gulp from 'gulp'
import postcssrc from 'gulp-postcss'
import plumber from 'gulp-plumber'
import gulpif from 'gulp-if'
import createSass from 'gulp-sass'
import rename from 'gulp-rename'
import less from 'gulp-less'
import typescript from 'gulp-typescript'
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

function isSassLang(lang: string): lang is 'scss' | 'sass' {
  return lang === 'scss' || lang === 'sass'
}

function isLessLang(lang: string): lang is 'less' {
  return lang === 'less'
}

function isTsLang(lang: string): lang is 'ts' {
  return lang === 'ts'
}

// function isPreprocessorLang(lang: string) {
//   return isSassLang(lang) || isLessLang(lang)
// }

export async function getTasks(options: BuildOptions) {
  const { root: cwd, weappTailwindcssOptions, outDir, src: srcBase, extensions, exclude, include, postcssOptions, preprocessorOptions, typescriptOptions } = options
  const globsSet = new Set<string>()
  const base = srcBase ? srcBase + '/' : ''
  const enableSass = Boolean(preprocessorOptions?.sass)
  const enableLess = Boolean(preprocessorOptions?.less)
  const enableTs = Boolean(typescriptOptions)
  let sass: ReturnType<typeof createSass>
  if (enableSass) {
    const { default: sassLib } = await import('sass')
    sass = createSass(sassLib)
  }

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
    return extensions[assetType]?.map((x) => {
      const src = `${base}**/*.${x}`
      globsSetAdd(src)
      const isTs = isTsLang(x)
      const loadTs = enableTs && isTs
      return function JsTask() {
        return gulp
          .src([src, ...globs], { cwd, since: gulp.lastRun(JsTask) })
          .pipe(plumber())
          .pipe(gulpif(loadTs, typescript(typeof typescriptOptions === 'boolean' ? {} : typescriptOptions)))
          .pipe(
            transformJs({
              babelParserOptions: isTs
                ? {
                    plugins: ['typescript']
                  }
                : undefined
            })
          )
          .pipe(
            gulpif(
              loadTs,
              rename({
                extname: '.js'
              })
            )
          )
          .pipe(
            gulp.dest(outDir, {
              cwd
            })
          )
      }
    })
  }

  function getJsonTasks() {
    const assetType = AssetType.Json
    const globs = getGlobs(assetType)
    globsSetAdd(globs)
    return extensions[assetType]?.map((x) => {
      const src = `${base}**/*.${x}`
      globsSetAdd(src)
      return function JsonTask() {
        return gulp
          .src([src, ...globs], { cwd, since: gulp.lastRun(JsonTask) })
          .pipe(plumber())
          .pipe(
            gulp.dest(outDir, {
              cwd
            })
          )
      }
    })
  }

  function getCssTasks() {
    const assetType = AssetType.Css
    const globs = getGlobs(assetType)
    globsSetAdd(globs)
    return extensions[assetType]?.map((x) => {
      const src = `${base}**/*.${x}`
      globsSetAdd(src)
      const loadSass = enableSass && isSassLang(x)
      const loadLess = enableLess && isLessLang(x)
      return function CssTask() {
        return gulp
          .src([src, ...globs], { cwd, since: gulp.lastRun(CssTask) })
          .pipe(plumber())
          .pipe(
            gulpif(
              loadSass,
              sass
                .sync(
                  // @ts-ignore
                  typeof preprocessorOptions?.sass === 'boolean' ? undefined : preprocessorOptions?.sass
                )
                .on('error', sass.logError)
            )
          )
          .pipe(gulpif(loadLess, less(typeof preprocessorOptions?.less === 'boolean' ? undefined : preprocessorOptions?.less)))
          .pipe(gulpif(Boolean(postcssOptions), postcssrc(postcssOptions?.plugins, postcssOptions?.options)))
          .pipe(transformWxss())
          .pipe(
            gulpif(
              loadSass || loadLess,
              rename({
                extname: '.wxss'
              })
            )
          )
          .pipe(
            gulp.dest(outDir, {
              cwd
            })
          )
      }
    })
  }

  function getHtmlTasks() {
    const assetType = AssetType.Html
    const globs = getGlobs(assetType)
    globsSetAdd(globs)
    return extensions[assetType]?.map((x) => {
      const src = `${base}**/*.${x}`
      globsSetAdd(src)
      return function HtmlTask() {
        return gulp
          .src([src, ...globs], { cwd, since: gulp.lastRun(HtmlTask) })
          .pipe(plumber())
          .pipe(transformWxml())
          .pipe(
            gulp.dest(outDir, {
              cwd
            })
          )
      }
    })
  }

  function copyOthers() {
    if (Array.isArray(include)) {
      const globs = include.map((x) => {
        return `${base}${x}`
      })
      globsSetAdd(globs)
      return gulp
        .src(globs, { cwd, since: gulp.lastRun(copyOthers) })
        .pipe(plumber())
        .pipe(
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
