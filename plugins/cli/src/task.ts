import { createPlugins } from 'weapp-tailwindcss/gulp'
import gulp from 'gulp'
import postcssrc from 'gulp-postcss'
import gulpif from 'gulp-if'
import createSass from 'gulp-sass'
import rename from 'gulp-rename'
import less from 'gulp-less'
import typescript from 'gulp-typescript'
import GlobsSet from './globsSet'
import { isStream } from './is-stream'
import { AssetType } from '@/enum'
import type { BuildOptions } from '@/type'
import { isLessLang, isObject, isSassLang, isTsLang, promisify } from '@/utils'

export function normalizePlugin(plugin: Function | [Function, ...any[]]) {
  if (isStream(plugin)) {
    return plugin
  }
  else if (typeof plugin === 'function') {
    return plugin.apply(plugin)
  }
  else if (Array.isArray(plugin)) {
    const [fn, ...args] = plugin
    return fn.apply(fn, args)
  }
}

export async function getTasks(options: BuildOptions) {
  let { typescriptOptions } = options
  const {
    root: cwd,
    weappTailwindcssOptions,
    outDir,
    src: srcBase,
    extensions,
    exclude,
    include,
    postcssOptions,
    preprocessorOptions,
    gulpChain,
  } = options
  const globsSet = new GlobsSet()
  const base = srcBase ? `${srcBase}/` : ''
  const enableSass = Boolean(preprocessorOptions?.sass)
  const enableLess = Boolean(preprocessorOptions?.less)

  function resolvePipes(plugins: any[], type: AssetType) {
    const newPlugins = gulpChain(plugins, type)
    if (newPlugins === undefined) {
      return plugins
    }
    return newPlugins.map(x => normalizePlugin(x)).filter(x => x)
  }

  if (typescriptOptions === true) {
    typescriptOptions = {
      tsConfigFileName: 'tsconfig.json',
    }
  }
  else if (isObject(typescriptOptions) && typescriptOptions.tsConfigFileName === undefined) {
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

  const outDirGlobs = [`!${outDir}/**/*`, `!./${outDir}/**/*`]

  function getGlobs(type: AssetType) {
    const globs: string[] = []
    if (typeof include === 'function') {
      globs.push(...include(type).map(x => x))
    }
    if (typeof exclude === 'function') {
      globs.push(...exclude(type).map(x => `!${x}`))
    }
    else if (Array.isArray(exclude)) {
      globs.push(...exclude.map(x => `!${x}`))
    }
    globs.push(...outDirGlobs)

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
        gulpTs = typescript.createProject(
          typescriptOptions.tsConfigFileName ?? 'tsconfig.json',
          typeof typescriptOptions === 'boolean' ? {} : typescriptOptions,
        )
      }

      return function JsTask() {
        let chain: NodeJS.ReadWriteStream = gulp.src([src, ...globs], { cwd, since: gulp.lastRun(JsTask) })
        const pipes: NodeJS.ReadWriteStream[] = []
        if (loadTs) {
          pipes.push(gulpTs())
        }
        pipes.push(transformJs({
          babelParserOptions:
            !enableTs && isTs
              ? {
                  plugins: ['typescript'],
                }
              : undefined,
        }))
        pipes.push(gulpif(
          loadTs,
          rename({
            extname: '.js',
          }),
        ))
        pipes.push(gulp.dest(outDir, {
          cwd,
        }))
        for (const p of resolvePipes(pipes, assetType)) {
          chain = chain.pipe(p)
        }
        return promisify(chain)
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
        const pipes = [gulp.dest(outDir, {
          cwd,
        })]
        let chain = gulp.src([src, ...globs], { cwd, since: gulp.lastRun(JsonTask) })

        for (const p of resolvePipes(pipes, assetType)) {
          chain = chain.pipe(p)
        }
        return promisify(chain)
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
        const pipes: NodeJS.ReadWriteStream[] = []
        if (loadSass) {
          // load sass and scss
          pipes.push(sass
            .sync(
              // @ts-ignore
              typeof preprocessorOptions?.sass === 'boolean' ? undefined : preprocessorOptions?.sass,
            )
            .on('error', sass.logError))
        }
        // load less
        pipes.push(gulpif(
          loadLess,
          less(typeof preprocessorOptions?.less === 'boolean' ? undefined : preprocessorOptions?.less),
        ))
        // load postcss
        pipes.push(gulpif(Boolean(postcssOptions), postcssrc(postcssOptions?.plugins, postcssOptions?.options)))
        // load weapp-tailwindcss transformWxss
        pipes.push(transformWxss())
        // load rename
        pipes.push(gulpif(
          loadSass || loadLess,
          rename({
            extname: '.wxss',
          }),
        ))
        // output
        pipes.push(gulp.dest(outDir, {
          cwd,
        }))

        for (const p of resolvePipes(pipes, assetType)) {
          chain = chain.pipe(p)
        }

        return promisify(chain)
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
        let chain = gulp
          .src([src, ...globs], { cwd, since: gulp.lastRun(HtmlTask) })
        const pipes = [transformWxml(), gulp.dest(outDir, {
          cwd,
        })]
        for (const p of resolvePipes(pipes, assetType)) {
          chain = chain.pipe(p)
        }
        return promisify(
          chain,
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

      let chain = gulp.src([...globs, ...outDirGlobs], { cwd, since: gulp.lastRun(copyOthers) })
      // output
      const pipes = [gulp.dest(outDir, {
        cwd,
      })]
      for (const p of pipes) {
        chain = chain.pipe(p)
      }
      return promisify(chain)
    }
  }

  return {
    getGlobs,
    getJsTasks,
    getJsonTasks,
    getCssTasks,
    getHtmlTasks,
    copyOthers,
    globsSet,
  }
}
