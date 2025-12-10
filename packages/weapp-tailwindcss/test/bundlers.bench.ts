import type { OutputAsset, OutputChunk } from 'rollup'
import type { Plugin, ResolvedConfig } from 'vite'
import type { Compiler, Configuration } from 'webpack'
import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MappingChars2String } from '@weapp-core/escape'
import gulp from 'gulp'
import gulpPostcss from 'gulp-postcss'
import postcss from 'postcss'
import { bench, describe } from 'vitest'
import { compile, createLoader, getMemfsCompiler5 } from 'webpack-build-utils'
import { UnifiedViteWeappTailwindcssPlugin } from '@/bundlers/vite'
import { vitePluginName } from '@/constants'
import { createPlugins } from '@/gulp'
import { UnifiedWebpackPluginV5 } from '@/webpack'

const require = createRequire(import.meta.url)
const tailwindcss = require('tailwindcss')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const webpackFixtureRoot = path.resolve(__dirname, 'fixtures/webpack/v5/wxml')
const viteFixtureRoot = path.resolve(__dirname, 'fixtures/vite')
const gulpFixtureRoot = path.resolve(__dirname, 'fixtures/gulp')

const webpackTailwindConfig = path.resolve(webpackFixtureRoot, 'tailwind.config.js')
const viteCssPath = path.resolve(viteFixtureRoot, 'src/index.css')
const viteHtmlPath = path.resolve(viteFixtureRoot, 'src/index.html')
const viteJsPath = path.resolve(viteFixtureRoot, 'src/index.js')
const gulpTailwindConfig = path.resolve(gulpFixtureRoot, 'tailwind.config.js')

const webpackCssProcessor = postcss([
  tailwindcss({ config: webpackTailwindConfig }),
])

const viteHtmlSource = fsSync.readFileSync(viteHtmlPath, 'utf8')
const viteCssSource = fsSync.readFileSync(viteCssPath, 'utf8')
const viteJsSource = fsSync.readFileSync(viteJsPath, 'utf8')
const viteResolvedConfig = {
  root: viteFixtureRoot,
  command: 'build',
  mode: 'production',
  isProduction: true,
  plugins: [],
  build: {
    outDir: path.resolve(viteFixtureRoot, 'dist'),
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
} as unknown as ResolvedConfig

const webpackBenchOptions = { time: 150, iterations: 3, minSamples: 3 }
const viteBenchOptions = { time: 150, iterations: 3, minSamples: 3 }
const gulpBenchOptions = { time: 120, iterations: 3, minSamples: 3 }

function createWebpackCompiler(mode: Configuration['mode']): Compiler {
  return getMemfsCompiler5({
    context: webpackFixtureRoot,
    mode,
    entry: {
      index: path.resolve(webpackFixtureRoot, 'pages/index.js'),
    },
    output: {
      path: path.resolve(webpackFixtureRoot, 'dist'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: createLoader(async function (source) {
            const basename = path.basename(this.resourcePath, path.extname(this.resourcePath))
            const wxmlPath = path.resolve(this.context, `${basename}.wxml`)
            const cssPath = path.resolve(this.context, `${basename}.css`)

            const [wxmlContent, cssContent] = await Promise.all([
              fs.readFile(wxmlPath, 'utf8'),
              fs.readFile(cssPath, 'utf8'),
            ])

            this.emitFile(`${basename}.wxml`, wxmlContent)
            const res = await webpackCssProcessor.process(cssContent, { from: undefined, map: false })
            this.emitFile(`${basename}.css`, res.css ?? res.toString())
            return source.toString()
          }),
        },
      ],
    },
    plugins: [
      new UnifiedWebpackPluginV5({
        mainCssChunkMatcher: name => name.endsWith('index.css'),
        customReplaceDictionary: MappingChars2String,
      }),
    ],
    optimization: {
      minimize: false,
    },
    infrastructureLogging: {
      level: 'error',
    },
  })
}

async function runWebpackBuild(mode: Configuration['mode']) {
  const compiler = createWebpackCompiler(mode)
  try {
    await compile(compiler)
  }
  finally {
    await new Promise<void>((resolve, reject) => {
      compiler.close((err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }
}

async function runVitePluginPipeline() {
  const plugins = UnifiedViteWeappTailwindcssPlugin({
    tailwindcssBasedir: viteFixtureRoot,
    mainCssChunkMatcher: name => name.endsWith('index.css'),
  }) ?? []

  const rewritePlugin = plugins.find(plugin => plugin.name === `${vitePluginName}:rewrite-css-imports`)
  const postPlugin = plugins.find(plugin => plugin.name === `${vitePluginName}:post`)

  const resolveId = getHook(rewritePlugin, 'resolveId')
  const transform = getHook(rewritePlugin, 'transform')

  await resolveId?.('tailwindcss', viteCssPath)
  await transform?.(viteCssSource, viteCssPath)

  const configResolved = typeof postPlugin?.configResolved === 'function'
    ? postPlugin.configResolved.bind(postPlugin)
    : undefined
  await configResolved?.(viteResolvedConfig)

  const generateBundle = typeof postPlugin?.generateBundle === 'function'
    ? postPlugin.generateBundle.bind(postPlugin)
    : undefined

  const bundle: Record<string, OutputAsset | OutputChunk> = {
    'index.html': createRollupAsset('index.html', viteHtmlSource),
    'assets/index.css': createRollupAsset('assets/index.css', viteCssSource),
    'assets/index.js': createRollupChunk('assets/index.js', viteJsSource),
  }

  await generateBundle?.({} as any, bundle)
}

async function runGulpPipeline() {
  const plugins = createPlugins({
    tailwindcssBasedir: gulpFixtureRoot,
  })

  const cssStream = gulp
    .src('src/**/*.css', { cwd: gulpFixtureRoot })
    .pipe(gulpPostcss([tailwindcss({ config: gulpTailwindConfig })]))
    .pipe(plugins.transformWxss())

  const jsStream = gulp
    .src('src/**/*.js', { cwd: gulpFixtureRoot })
    .pipe(plugins.transformJs())

  const wxmlStream = gulp
    .src('src/**/*.wxml', { cwd: gulpFixtureRoot })
    .pipe(plugins.transformWxml())

  await Promise.all([
    drain(cssStream),
    drain(jsStream),
    drain(wxmlStream),
  ])
}

function drain(stream: NodeJS.ReadableStream) {
  return new Promise<void>((resolve, reject) => {
    stream.on('data', () => {})
    stream.on('error', reject)
    stream.on('end', resolve)
    stream.on('finish', resolve)
    stream.resume()
  })
}

function createRollupAsset(fileName: string, source: string): OutputAsset {
  return {
    type: 'asset',
    fileName,
    name: undefined,
    source,
    needsCodeReference: false,
    names: [],
    originalFileName: null,
    originalFileNames: [],
  } as OutputAsset
}

function createRollupChunk(fileName: string, code: string): OutputChunk {
  return {
    type: 'chunk',
    fileName,
    name: path.basename(fileName, path.extname(fileName)),
    code,
    map: null,
    facadeModuleId: null,
    moduleIds: [],
    modules: {},
    imports: [],
    exports: [],
    dynamicImports: [],
    implicitlyLoadedBefore: [],
    importedBindings: {},
    isEntry: true,
    isDynamicEntry: false,
    referencedFiles: [],
    isImplicitEntry: false,
    sourcemapFileName: null,
    preliminaryFileName: null,
  } as unknown as OutputChunk
}

type HookName = 'resolveId' | 'transform'
function getHook(plugin: Plugin | undefined, key: HookName) {
  const hook = plugin?.[key as keyof Plugin]
  if (!hook) {
    return undefined
  }
  if (typeof hook === 'function') {
    return (hook as (...args: any[]) => any).bind(plugin)
  }
  const handler = (hook as { handler?: unknown }).handler
  if (typeof handler === 'function') {
    return handler.bind(plugin)
  }
  return undefined
}

describe('webpack plugin benchmarks', () => {
  bench(
    'webpack v5 build (wxml fixture, development)',
    async () => {
      await runWebpackBuild('development')
    },
    webpackBenchOptions,
  )

  bench(
    'webpack v5 build (wxml fixture, production)',
    async () => {
      await runWebpackBuild('production')
    },
    webpackBenchOptions,
  )
})

describe('vite plugin benchmarks', () => {
  bench(
    'vite build (miniapp fixture, plugin enabled)',
    async () => {
      await runVitePluginPipeline()
    },
    viteBenchOptions,
  )
})

describe('gulp plugin benchmarks', () => {
  bench(
    'gulp transforms (css/js/wxml pipeline)',
    async () => {
      await runGulpPipeline()
    },
    gulpBenchOptions,
  )
})
