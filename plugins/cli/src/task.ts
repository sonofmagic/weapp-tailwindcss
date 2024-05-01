import { createPlugins } from 'weapp-tailwindcss/gulp'
import gulp from 'gulp'
import postcssrc from 'gulp-postcss'
// import debug from 'gulp-debug'
// import plumber from 'gulp-plumber'
import gulpif from 'gulp-if'
import createSass from 'gulp-sass'
import rename from 'gulp-rename'
import less from 'gulp-less'
import typescript from 'gulp-typescript'
import GlobsSet from './globsSet'
import { AssetType } from '@/enum'
import type { BuildOptions } from '@/type'
import { isObject, promisify } from '@/utils'

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
  const globsSet = new GlobsSet()
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
    globs.push(`!./${outDir}/**/*`)
    return globs
  }

  function getJsTasks() {
    const assetType = AssetType.JavaScript
    const globs = getGlobs(assetType)
    globsSet.add(globs)
    return extensions[assetType]?.map((x) => {
      const src = `${base}**/*.${x}`
      globsSet.add(src)
      const isTs = isTsLang(x)
      const loadTs = enableTs && isTs
      let gulpTs: ReturnType<typeof typescript.createProject>
      if (enableTs && typeof typescriptOptions !== 'boolean') {
        gulpTs = typescript.createProject(typescriptOptions.tsConfigFileName ?? 'tsconfig.json', typeof typescriptOptions === 'boolean' ? {} : typescriptOptions)
      }

      return function JsTask() {
        let chain: NodeJS.ReadWriteStream = gulp.src([src, ...globs], { cwd, since: gulp.lastRun(JsTask) })
        if (loadTs) {
          chain = chain.pipe(gulpTs())
        }
        return promisify(
          chain
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
        )
      }
    })
  }

  function getJsonTasks() {
    const assetType = AssetType.Json
    const globs = getGlobs(assetType)
    globsSet.add(globs)
    return extensions[assetType]?.map((x) => {
      const src = `${base}**/*.${x}`
      globsSet.add(src)
      return function JsonTask() {
        return promisify(
          gulp.src([src, ...globs], { cwd, since: gulp.lastRun(JsonTask) }).pipe(
            gulp.dest(outDir, {
              cwd
            })
          )
        )
      }
    })
  }

  function getCssTasks() {
    const assetType = AssetType.Css
    const globs = getGlobs(assetType)
    globsSet.add(globs)
    return extensions[assetType]?.map((x) => {
      const src = `${base}**/*.${x}`
      globsSet.add(src)
      const loadSass = enableSass && isSassLang(x)
      const loadLess = enableLess && isLessLang(x)
      return function CssTask() {
        let chain: NodeJS.ReadWriteStream = gulp.src([src, ...globs], { cwd, since: gulp.lastRun(CssTask) })

        // .pipe(plumber())
        // .on('pipe', (...args) => {
        //   console.log(args)
        // })
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
        return promisify(
          chain
            // .pipe(debug({ title: 'css start:' }))
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
            // .pipe(debug({ title: 'css end:' }))
            .pipe(
              gulp.dest(outDir, {
                cwd
              })
            )
        )
      }
    })
  }

  function getHtmlTasks() {
    const assetType = AssetType.Html
    const globs = getGlobs(assetType)
    globsSet.add(globs)
    return extensions[assetType]?.map((x) => {
      const src = `${base}**/*.${x}`
      globsSet.add(src)
      return function HtmlTask() {
        return promisify(
          gulp
            .src([src, ...globs], { cwd, since: gulp.lastRun(HtmlTask) })
            .pipe(transformWxml())
            .pipe(
              gulp.dest(outDir, {
                cwd
              })
            )
        )
      }
    })
  }

  function copyOthers() {
    if (Array.isArray(include)) {
      const globs = include.map((x) => {
        return `${base}${x}`
      })
      globsSet.add(globs)
      return promisify(
        gulp.src(globs, { cwd, since: gulp.lastRun(copyOthers) }).pipe(
          gulp.dest(outDir, {
            cwd
          })
        )
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
