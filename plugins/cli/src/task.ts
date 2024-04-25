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
import { isObject } from '@/utils'

function isSassLang(lang: string): lang is 'scss' | 'sass' {
  return lang === 'scss' || lang === 'sass'
}

function isLessLang(lang: string): lang is 'less' {
  return lang === 'less'
}

function isTsLang(lang: string): lang is 'ts' {
  return lang === 'ts'
}

export async function getTasks(options: BuildOptions) {
  let { typescriptOptions } = options
  const { root: cwd, weappTailwindcssOptions, outDir, src: srcBase, extensions, exclude, include, postcssOptions, preprocessorOptions } = options
  const globsSet = new Set<string>()
  const base = srcBase ? srcBase + '/' : ''
  const enableSass = Boolean(preprocessorOptions?.sass)
  const enableLess = Boolean(preprocessorOptions?.less)

  if (typescriptOptions === true) {
    typescriptOptions = {
      tsConfigFileName: 'tsconfig.json'
    }
  } else if (isObject(typescriptOptions) && typescriptOptions.tsConfigFileName === undefined) {
    typescriptOptions.tsConfigFileName = 'tsconfig.json'
  }

  const enableTs = Boolean(typescriptOptions)

  let sass: ReturnType<typeof createSass>
  if (enableSass) {
    const sassLib = await import('sass')
    // { default: sassLib }
    sass = createSass(sassLib)
  }
  const { transformJs, transformWxml, transformWxss } = createPlugins(weappTailwindcssOptions)

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

  function getJsTasks() {
    const assetType = AssetType.JavaScript
    const globs = getGlobs(assetType)
    globsSetAdd(globs)
    return extensions[assetType]?.map((x) => {
      const src = `${base}**/*.${x}`
      globsSetAdd(src)
      const isTs = isTsLang(x)
      const loadTs = enableTs && isTs
      let gulpTs: ReturnType<typeof typescript.createProject>
      if (enableTs && typeof typescriptOptions !== 'boolean') {
        gulpTs = typescript.createProject(typescriptOptions.tsConfigFileName ?? 'tsconfig.json', typeof typescriptOptions === 'boolean' ? {} : typescriptOptions)
      }

      return function JsTask() {
        let chain: NodeJS.ReadWriteStream = gulp.src([src, ...globs], { cwd, since: gulp.lastRun(JsTask) }).pipe(plumber())
        if (loadTs) {
          chain = chain.pipe(gulpTs())
        }
        return chain
          .pipe(
            transformJs({
              babelParserOptions:
                !enableTs && isTs
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
        let chain: NodeJS.ReadWriteStream = gulp.src([src, ...globs], { cwd, since: gulp.lastRun(CssTask) }).pipe(plumber())
        if (loadSass) {
          chain = chain.pipe(
            sass
              .sync(
                // @ts-ignore
                typeof preprocessorOptions?.sass === 'boolean' ? undefined : preprocessorOptions?.sass
              )
              .on('error', sass.logError)
          )
        }
        return chain
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
