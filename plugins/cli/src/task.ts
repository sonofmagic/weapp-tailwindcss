import { AssetType } from '@/enum'
import { isLessLang, isObject, isSassLang, isTsLang, promisify } from '@/utils'
import gulp from 'gulp'
import less from 'gulp-less'
import postcssrc from 'gulp-postcss'
import rename from 'gulp-rename'
import createSass from 'gulp-sass'
import { isPackageExists } from 'local-pkg'
import postcssScssParser from 'postcss-scss'
import { createPlugins } from 'weapp-tailwindcss/gulp'
import type { BuildOptions } from '@/type'
import type compileTs from 'gulp-typescript'
import { defaultNodeModulesDirs } from './defaults'
import GlobsSet from './globsSet'
import { isStream } from './is-stream'

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

export function resolveTask({ pipes, globs, since, cwd }: {
  pipes: NodeJS.ReadWriteStream[]
  globs: string | string[]
  since: any
  cwd: string
}) {
  let chain: NodeJS.ReadWriteStream = gulp.src(globs, { cwd, since: gulp.lastRun(since) })

  for (const p of pipes) {
    chain = chain.pipe(p)
  }
  return promisify(chain)
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
    if (!isPackageExists('sass')) {
      throw new Error('请先执行 npm / yarn / pnpm 命令安装 `sass` 后重试!')
    }
    const sassLib = await import('sass')
    sass = createSass(sassLib)
  }
  let ts: typeof compileTs
  let gulpTs: compileTs.Project
  if (enableTs) {
    if (!isPackageExists('typescript')) {
      throw new Error('请先执行 npm / yarn / pnpm 命令安装 `typescript` 后重试!')
    }
    ts = (await import('gulp-typescript')).default

    if (typeof typescriptOptions !== 'boolean') {
      gulpTs = ts.createProject(
        typescriptOptions.tsConfigFileName ?? 'tsconfig.json',
        typescriptOptions.settings,
      )
    }
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

      return function JsTask() {
        const pipes: NodeJS.ReadWriteStream[] = []
        if (loadTs && gulpTs) {
          pipes.push(gulpTs().on('error', () => {}))
        }
        pipes.push(transformJs({
          babelParserOptions:
            !enableTs && isTs
              ? {
                  plugins: ['typescript'],
                }
              : undefined,
        }))
        if (loadTs) {
          pipes.push(rename({
            extname: '.js',
          }))
        }

        pipes.push(gulp.dest(outDir, {
          cwd,
        }))

        return resolveTask({
          pipes: resolvePipes(pipes, assetType),
          cwd,
          globs: [src, ...globs],
          since: JsTask,
        })
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

        return resolveTask({
          cwd,
          globs: [src, ...globs],
          pipes: resolvePipes(pipes, assetType),
          since: JsonTask,
        })
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
        if (loadLess) {
          // load less
          pipes.push(less(typeof preprocessorOptions?.less === 'boolean' ? undefined : preprocessorOptions?.less))
        }

        if (postcssOptions) {
          // load postcss
          pipes.push(postcssrc(postcssOptions?.plugins, postcssOptions?.options))
        }
        if (x === 'scss' && !enableSass) {
          pipes.push(transformWxss({
            postcssOptions: {
              options: {
                parser: postcssScssParser,
              },
            },
          }))
        }
        else {
          pipes.push(transformWxss())
        }
        // load weapp-tailwindcss transformWxss

        if (loadSass || loadLess) {
          // load rename
          pipes.push(rename({
            extname: '.wxss',
          }))
        }

        // output
        pipes.push(gulp.dest(outDir, {
          cwd,
        }))

        return resolveTask({
          cwd,
          globs: [src, ...globs],
          pipes: resolvePipes(pipes, assetType),
          since: CssTask,
        })
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
        const pipes = [transformWxml(), gulp.dest(outDir, {
          cwd,
        })]

        return resolveTask({
          cwd,
          globs: [src, ...globs],
          pipes: resolvePipes(pipes, assetType),
          since: HtmlTask,
        })
      }
    })
  }

  function copyOthers() {
    if (Array.isArray(include)) {
      const globs = include.map((x) => {
        return `${base}${x}`
      })
      globsSet.add(globs)

      // output
      const pipes = [gulp.dest(outDir, {
        cwd,
      })]

      return resolveTask({
        cwd,
        globs: [...globs, ...outDirGlobs, ...defaultNodeModulesDirs.map(x => `!${x}`)],
        pipes,
        since: copyOthers,
      })
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
