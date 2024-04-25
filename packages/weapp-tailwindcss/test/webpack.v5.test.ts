import path from 'node:path'
import fs from 'node:fs/promises'
import fss from 'node:fs'
import type { Compiler, Configuration } from 'webpack'
import webpack from 'webpack'
import postcss from 'postcss'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { runLoaders } from 'promisify-loader-runner'
import { copySync, mkdirSync } from 'fs-extra'
// @ts-ignore
import { UnifiedWebpackPluginV5 as UnifiedWebpackPluginV5WithLoader } from '..'
import { getMemfsCompiler5 as getCompiler5, compile, readAssets, createLoader, getErrors, getWarnings } from './helpers'
import { UnifiedWebpackPluginV5 } from '@/index'
import { MappingChars2String } from '@/escape'
function createCompiler(params: Pick<Configuration, 'mode' | 'entry'> & { tailwindcssConfig: string; devtool?: string }) {
  const { entry, mode, tailwindcssConfig, devtool } = params

  const processor = postcss([
    // require('autoprefixer')(),
    require('tailwindcss')({ config: tailwindcssConfig })
    // require('postcss-rem-to-responsive-pixel')({
    //   rootValue: 32,
    //   propList: ['*'],
    //   transformUnit: 'rpx'
    // })
  ])

  return getCompiler5({
    context: path.resolve(__dirname, '..'),
    mode,
    entry,
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: '[name].js', // ?var=[fullhash]
      chunkFilename: '[id].[name].js' // ?ver=[fullhash]
    },
    devtool,
    module: {
      rules: [
        {
          test: /\.m?js$/,
          // https://webpack.js.org/configuration/module/#useentry
          use: createLoader(async function (source) {
            const basename = path.basename(this.resourcePath, path.extname(this.resourcePath))
            const filename = basename + '.wxml'
            const content = await fs.readFile(path.resolve(this.context, filename), {
              encoding: 'utf8'
            })
            this.emitFile(filename, content)

            const cssFilename = basename + '.css'

            const cssContent = await fs.readFile(path.resolve(this.context, cssFilename), {
              encoding: 'utf8'
            })

            const res = await processor.process(cssContent, {
              from: undefined,
              map: false
            })
            this.emitFile(cssFilename, res.toString())
            return source
            // this.emitFile('hello.xx', '12345')
            // console.log()
          })
        }
      ]
    }
  })
}
describe('webpack5 plugin', () => {
  let compiler: Compiler
  let prodCompiler: Compiler
  let emptyCompiler: Compiler
  // let sourceMapCompiler: Compiler
  const cacheDir = path.resolve(process.cwd(), 'node_modules/.cache', 'tailwindcss-patch')
  const cacheJson = path.resolve(cacheDir, 'index.json')
  beforeAll(() => {
    const isExisted = fss.existsSync(cacheDir)
    if (!isExisted) {
      mkdirSync(cacheDir, {
        recursive: true
      })
    }

    copySync(path.resolve(__dirname, 'fixtures/json/index.json'), cacheJson)
    expect(fss.existsSync(cacheDir)).toBe(true)
    expect(fss.existsSync(cacheJson)).toBe(true)
  })

  beforeEach(() => {
    compiler = createCompiler({
      mode: 'development',
      entry: {
        wxml: path.resolve(__dirname, './fixtures/webpack/v5/wxml/pages/index.js')
      },
      tailwindcssConfig: path.resolve(__dirname, './fixtures/webpack/v5/wxml/tailwind.config.js')
    })

    prodCompiler = createCompiler({
      mode: 'production',
      entry: {
        wxml: path.resolve(__dirname, './fixtures/webpack/v5/wxml/pages/index.js')
      },
      tailwindcssConfig: path.resolve(__dirname, './fixtures/webpack/v5/wxml/tailwind.config.js')
    })

    emptyCompiler = createCompiler({
      mode: 'production',
      entry: {
        wxml: path.resolve(__dirname, './fixtures/webpack/v5/empty/index.js')
      },
      tailwindcssConfig: path.resolve(__dirname, './fixtures/webpack/v5/empty/tailwind.config.js')
    })

    // sourceMapCompiler = createCompiler({
    //   mode: 'production',
    //   entry: {
    //     wxml: path.resolve(__dirname, './fixtures/webpack/v5/wxml/pages/index.js')
    //   },
    //   tailwindcssConfig: path.resolve(__dirname, './fixtures/webpack/v5/wxml/tailwind.config.js'),
    //   devtool: 'source-map'
    // })
  })

  afterAll(() => {
    expect(fss.existsSync(cacheDir)).toBe(true)
    expect(fss.existsSync(cacheJson)).toBe(true)
  })
  it('common', async () => {
    let timeStart: number
    let timeTaken: number
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      customReplaceDictionary: MappingChars2String,
      onStart() {
        timeStart = performance.now()
      },
      onEnd() {
        timeTaken = performance.now() - timeStart
        console.log(`[common] case processAssets executed in ${timeTaken}ms`)
      }
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  // it('ast-grep common', async () => {
  //   let timeStart: number
  //   let timeTaken: number
  //   new UnifiedWebpackPluginV5({
  //     mainCssChunkMatcher(name) {
  //       return path.basename(name) === 'index.css'
  //     },
  //     customReplaceDictionary: MappingChars2String,
  //     onStart() {
  //       timeStart = performance.now()
  //     },
  //     onEnd() {
  //       timeTaken = performance.now() - timeStart
  //       console.log(`[common] case processAssets executed in ${timeTaken}ms`)
  //     },
  //     jsAstTool: 'ast-grep'
  //   }).apply(compiler)

  //   const stats = await compile(compiler)

  //   expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
  //   expect(getErrors(stats)).toMatchSnapshot('errors')
  //   expect(getWarnings(stats)).toMatchSnapshot('warnings')
  // })

  it('common with rem2rpx', async () => {
    let timeStart: number
    let timeTaken: number
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      customReplaceDictionary: MappingChars2String,
      onStart() {
        timeStart = performance.now()
      },
      onEnd() {
        timeTaken = performance.now() - timeStart
        console.log(`[common] case processAssets executed in ${timeTaken}ms`)
      },
      rem2rpx: true
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('common build twice for cache', async () => {
    let timeStart: number
    let timeTaken: number
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      customReplaceDictionary: MappingChars2String,
      onStart() {
        timeStart = performance.now()
      },
      onEnd() {
        timeTaken = performance.now() - timeStart
        console.log(`[common] case processAssets executed in ${timeTaken}ms`)
      }
    }).apply(compiler)

    let stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')

    stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  // it('common with source map', async () => {
  //   let timeStart: number
  //   let timeTaken: number
  //   new UnifiedWebpackPluginV5({
  //     mainCssChunkMatcher(name) {
  //       return path.basename(name) === 'index.css'
  //     },
  //     customReplaceDictionary: 'simple',
  //     onStart() {
  //       timeStart = performance.now()
  //     },
  //     onEnd() {
  //       timeTaken = performance.now() - timeStart
  //       console.log(`[common with source map] case processAssets executed in ${timeTaken}ms`)
  //     }
  //   }).apply(sourceMapCompiler)

  //   const stats = await compile(compiler)

  //   expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
  //   expect(getErrors(stats)).toMatchSnapshot('errors')
  //   expect(getWarnings(stats)).toMatchSnapshot('warnings')
  // })

  it('common 0', async () => {
    let timeStart: number
    let timeTaken: number
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      customReplaceDictionary: MappingChars2String,
      onStart() {
        timeStart = performance.now()
      },
      onEnd() {
        timeTaken = performance.now() - timeStart
        console.log(`[common] case processAssets executed in ${timeTaken}ms`)
      },
      runtimeLoaderPath: path.resolve(__dirname, '../dist/weapp-tw-runtime-loader.js')
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('common with loader', async () => {
    let timeStart: number
    let timeTaken: number
    new UnifiedWebpackPluginV5WithLoader({
      mainCssChunkMatcher(name: any) {
        return path.basename(name) === 'index.css'
      },
      onStart() {
        timeStart = performance.now()
      },
      onEnd() {
        timeTaken = performance.now() - timeStart
        console.log(`[common with loader] case processAssets executed in ${timeTaken}ms`)
      }
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('empty build', async () => {
    let timeStart: number
    let timeTaken: number
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      onStart() {
        timeStart = performance.now()
      },
      onEnd() {
        timeTaken = performance.now() - timeStart
        console.log(`[empty build] common case processAssets executed in ${timeTaken}ms`)
      }
    }).apply(emptyCompiler)

    const stats = await compile(emptyCompiler)

    expect(readAssets(emptyCompiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('unified common', async () => {
    let timeStart: number
    let timeTaken: number
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      onStart() {
        timeStart = performance.now()
      },
      onEnd() {
        timeTaken = performance.now() - timeStart
        console.log(`[unified common] common case processAssets executed in ${timeTaken}ms`)
      }
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('unified prod common', async () => {
    let timeStart: number
    let timeTaken: number
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      onStart() {
        timeStart = performance.now()
      },
      onEnd() {
        timeTaken = performance.now() - timeStart
        console.log(`[unified prod common] common case processAssets executed in ${timeTaken}ms`)
      }
    }).apply(prodCompiler)

    const stats = await compile(prodCompiler)

    expect(readAssets(prodCompiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  // it('ast grep unified prod common', async () => {
  //   let timeStart: number
  //   let timeTaken: number
  //   new UnifiedWebpackPluginV5({
  //     mainCssChunkMatcher(name) {
  //       return path.basename(name) === 'index.css'
  //     },
  //     onStart() {
  //       timeStart = performance.now()
  //     },
  //     onEnd() {
  //       timeTaken = performance.now() - timeStart
  //       console.log(`[unified prod common] common case processAssets executed in ${timeTaken}ms`)
  //     },
  //     jsAstTool: 'ast-grep'
  //   }).apply(prodCompiler)

  //   const stats = await compile(prodCompiler)

  //   expect(readAssets(prodCompiler, stats)).toMatchSnapshot('assets')
  //   expect(getErrors(stats)).toMatchSnapshot('errors')
  //   expect(getWarnings(stats)).toMatchSnapshot('warnings')
  // })

  it('disabled true', async () => {
    let timeStart: number
    let timeTaken: number
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      disabled: true,
      onStart() {
        timeStart = performance.now()
      },
      onEnd() {
        timeTaken = performance.now() - timeStart
        // 不会执行
        console.log(`[disabled true] common case processAssets executed in ${timeTaken}ms`)
      }
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('mangle true', async () => {
    let timeStart: number
    let timeTaken: number
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },

      customReplaceDictionary: MappingChars2String,
      mangle: true,
      onStart() {
        timeStart = performance.now()
      },
      onEnd() {
        timeTaken = performance.now() - timeStart
        // 不会执行
        console.log(`[mangle true] common case processAssets executed in ${timeTaken}ms`)
      }
    }).apply(compiler)

    const stats = await compile(compiler)
    // const { runtimeSet, classGenerator } = useStore()
    // expect(runtimeSet.size).toBeGreaterThan(0)

    // expect(classGenerator.newClassSize).toBeGreaterThan(0)
    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('mangle options', async () => {
    let timeStart: number
    let timeTaken: number
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      mangle: {
        classGenerator: {
          classPrefix: ''
        }
      },
      customReplaceDictionary: MappingChars2String,
      onStart() {
        timeStart = performance.now()
      },
      onEnd() {
        timeTaken = performance.now() - timeStart
        // 不会执行
        console.log(`[mangle options] common case processAssets executed in ${timeTaken}ms`)
      }
    }).apply(compiler)

    const stats = await compile(compiler)
    // const { runtimeSet, classGenerator } = useStore()
    // expect(runtimeSet.size).toBeGreaterThan(0)

    // expect(classGenerator.newClassSize).toBeGreaterThan(0)
    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('mangle options with default mangleClassFilter', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      mangle: {
        classGenerator: {
          classPrefix: 'ice-'
        }
      }
    }).apply(compiler)

    const stats = await compile(compiler)
    // const { runtimeSet, classGenerator } = useStore()
    // expect(runtimeSet.size).toBeGreaterThan(0)

    // expect(classGenerator.newClassSize).toBeGreaterThan(0)
    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('mangle options mangleClassFilter all true', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      mangle: {
        classGenerator: {
          classPrefix: 'som-'
        },
        mangleClassFilter: () => true
      }
    }).apply(compiler)

    const stats = await compile(compiler)
    // const { runtimeSet, classGenerator } = useStore()
    // expect(runtimeSet.size).toBeGreaterThan(0)

    // expect(classGenerator.newClassSize).toBeGreaterThan(0)
    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('multiple tailwindcss contexts', async () => {
    // WEBPACK IS TREE-SHAKING
    const multipleContextsPath = path.resolve(__dirname, './fixtures/webpack/v5/multiple-contexts')
    expect(fss.existsSync(multipleContextsPath)).toBe(true)
    const indexEntry = path.resolve(multipleContextsPath, './src/index.js')
    expect(fss.existsSync(indexEntry)).toBe(true)
    const moduleEntry = path.resolve(multipleContextsPath, './src/module/index.js')
    expect(fss.existsSync(moduleEntry)).toBe(true)
    const customCompiler = getCompiler5({
      mode: 'production',
      // 目录下必须有一个 package.json，不然 css 直接 sideEffects 被干掉了
      // 或者设置 sideEffects: false
      optimization: {
        // minimize: true
        // css purge
        sideEffects: false
      },
      entry: {
        index: './src/index.js',
        module: './src/module/index.js'
      },
      // entry: indexEntry,
      context: multipleContextsPath,
      output: {
        path: path.resolve(multipleContextsPath, './dist')
        // filename: '[name].js', // ?var=[fullhash]
        // chunkFilename: '[id].[name].js' // ?ver=[fullhash]
      },
      plugins: [new MiniCssExtractPlugin()],
      // MiniCssExtractPlugin.loader,
      // MiniCssExtractPlugin.loader,
      module: {
        rules: [
          {
            test: /\.css$/i,
            use: [
              MiniCssExtractPlugin.loader,
              createLoader(function (source) {
                return source
              }),
              'css-loader',
              'postcss-loader'
              // createLoader(function (source) {
              //   return source
              // })
              // createLoader(function (source) {
              //   const f = path.relative(multipleContextsPath + '/src', this.resourcePath)
              //   this.emitFile('tmp_' + f, source)
              //   return source
              // })
              // Error: ENOENT: no such file or directory,
              // "ModuleBuildError: Module build failed
              // TODO
              // 为什么一加 postcss-loader 就报错??
              // {
              //   loader: 'postcss-loader',
              //   options: {
              //     postcssOptions: {
              //       config: path.resolve(multipleContextsPath, './postcss.config.js')
              //     }
              //   }
              // }
            ] // , 'postcss-loader'] // 'style-loader', // , 'postcss-loader']
          }
        ]
      }
      // resolve: {}
    })

    const stats = await compile(customCompiler)
    const assets = readAssets(customCompiler, stats)
    expect(assets).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('multiple tailwindcss contexts raw case 0', async () => {
    const multipleContextsPath = path.resolve(__dirname, './fixtures/webpack/v5/multiple-contexts')
    const twConfig = path.resolve(multipleContextsPath, 'tailwind.config.js')
    const twmConfig = path.resolve(multipleContextsPath, 'tailwind.config.module.js')
    const processor = postcss([require('tailwindcss')({ config: twConfig })])
    const moduleProcessor = postcss([require('tailwindcss')({ config: twmConfig })])
    const customCompiler = getCompiler5({
      mode: 'production',
      // 目录下必须有一个 package.json，不然 css 直接 sideEffects 被干掉了
      // 或者设置 sideEffects: false
      optimization: {
        // minimize: true
        // css purge
        sideEffects: false
      },
      entry: {
        index: './src/index.js',
        module: './src/module/index.js'
      },
      // entry: indexEntry,
      context: multipleContextsPath,
      output: {
        path: path.resolve(multipleContextsPath, './dist')
        // filename: '[name].js', // ?var=[fullhash]
        // chunkFilename: '[id].[name].js' // ?ver=[fullhash]
      },
      module: {
        rules: [
          // {
          //   test: /\.js$/i,
          //   use: [
          //     createLoader(function (source) {
          //       return source
          //     })
          //   ]
          // },
          {
            test: /\.css$/i,
            use: [
              // processor
              // moduleProcessor
              createLoader(
                async function (source) {
                  // eslint-disable-next-line unicorn/prefer-ternary
                  if (/module[/\\]index\.css$/.test(this.resourcePath)) {
                    const res = await moduleProcessor.process(source)
                    this.emitFile('module.css', res.css)
                    // return 'module.exports = ' + JSON.stringify(css)
                  } else {
                    // 直接变成空字符串 or postcss
                    const res = await processor.process(source)
                    this.emitFile('index.css', res.css)
                  }
                  // 做成文件方便查看快照
                  return 'module.exports = " "' // JSON.stringify(css) //  JSON.stringify(source)
                },
                {
                  ident: 'css-file-emiter'
                }
              )
            ]
          }
        ]
      }
      // resolve: {}
    })

    const stats = await compile(customCompiler)
    const assets = readAssets(customCompiler, stats)
    expect(assets).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('multipleContexts case 1', async () => {
    const context = path.resolve(__dirname, './fixtures/webpack/v5/multiple-contexts')
    const pc = path.resolve(context, 'postcss.config.js')
    const mpc = path.resolve(context, 'postcss.config.module.js')
    const customCompiler = getCompiler5({
      mode: 'production',

      optimization: {
        sideEffects: false
      },
      entry: {
        index: './src/index.js',
        module: './src/module/index.js'
      },
      context,
      plugins: [new MiniCssExtractPlugin()],
      //
      module: {
        rules: [
          {
            test: /\.css$/i,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  // function
                  postcssOptions: (loaderContext: webpack.LoaderContext<object>) => {
                    const isModule = /module[/\\](?:\w+[/\\])*\w+\.css$/.test(loaderContext.resourcePath)
                    if (isModule) {
                      return {
                        ...require(mpc)
                      }
                    }
                    return {
                      ...require(pc)
                    }
                  }
                }
              }
            ] //, 'css-loader', 'postcss-loader'],
          }
        ]
      }
    })
    // @ts-ignore
    // customCompiler.outputFileSystem = fs
    const stats = await compile(customCompiler)
    const assets = readAssets(customCompiler, stats)
    expect(assets).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('hijack custom loader', async () => {
    const hijackPath = path.resolve(__dirname, './fixtures/webpack/v5/hijack')
    const anotherLoader = createLoader(
      function (source) {
        return source + '\nconst c = 2\nconsole.log(c)'
      },
      {
        ident: 'anotherLoader'
      }
    ) as webpack.NormalModule['loaders'][number]
    // https://github.com/webpack/webpack/blob/main/lib/webpack.js#L71
    // https://github.com/webpack/webpack/blob/main/lib/NormalModule.js#L559
    const customCompiler = getCompiler5({
      mode: 'production',
      optimization: {
        sideEffects: false
      },
      entry: {
        index: './index.js'
      },
      // entry: indexEntry,
      context: hijackPath,
      output: {
        path: path.resolve(hijackPath, './dist')
        // filename: '[name].js', // ?var=[fullhash]
        // chunkFilename: '[id].[name].js' // ?ver=[fullhash]
      },
      plugins: [
        {
          apply(compiler: Compiler) {
            const pluginName = 'hijack-a-plane-plugin'
            const { NormalModule } = compiler.webpack
            compiler.hooks.compilation.tap(pluginName, (compilation) => {
              NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, (loaderContext, module) => {
                // const idx = module.loaders.findIndex((x) => x.loader.includes('postcss-loader'))
                // console.log(idx)
                // const target = module.loaders[0]
                // console.log(module.loaders)
                // 最后执行
                module.loaders.unshift(anotherLoader)
                // 最先执行
                // module.loaders.push(anotherLoader)
              })
            })
          }
        }
      ],
      module: {
        rules: [
          {
            test: /\.js$/i,
            use: [
              {
                ...createLoader(
                  function (source) {
                    return source + '\nconst b = 1\nconsole.log(b)'
                  },
                  {
                    ident: 'hijack'
                  }
                )
              }
            ]
          }
        ]
      }
      // resolve: {}
    })

    const stats = await compile(customCompiler)
    const assets = readAssets(customCompiler, stats)
    expect(assets).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('raw run loader', async () => {
    const zeroLoader = createLoader(function (source) {
      return source + '0'
    })
    const hijackPath = path.resolve(__dirname, './fixtures/webpack/v5/hijack/index.js')
    const result = await runLoaders(
      // @ts-ignore
      {
        // @ts-ignore
        resource: hijackPath,
        loaders: [
          {
            ...zeroLoader
          }
        ]
      }
    )
    // expect(err).toBeFalsy()
    expect(result).toBeTruthy()
    const isArr = Array.isArray(result.result)
    expect(isArr).toBe(true)
    if (isArr) {
      // @ts-ignore
      expect(result.result[0]).toMatchSnapshot()
    }
  })

  it('hijack custom loader 0', async () => {
    const hijackPath = path.resolve(__dirname, './fixtures/webpack/v5/hijack')

    const customCompiler = getCompiler5({
      mode: 'production',
      optimization: {
        sideEffects: false
      },
      entry: {
        index: './index.js'
      },
      // entry: indexEntry,
      context: hijackPath,
      output: {
        path: path.resolve(hijackPath, './dist')
        // filename: '[name].js', // ?var=[fullhash]
        // chunkFilename: '[id].[name].js' // ?ver=[fullhash]
      },
      plugins: [
        {
          apply(compiler: Compiler) {
            const pluginName = 'hijack-a-plane-plugin'
            const { NormalModule } = compiler.webpack
            compiler.hooks.compilation.tap(pluginName, (compilation) => {
              NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, (loaderContext, module) => {
                // const idx = module.loaders.findIndex((x) => x.loader.includes('postcss-loader'))
                // console.log(idx)
                const target = module.loaders[0]

                module.loaders[0] = {
                  ...(createLoader(
                    async function () {
                      // @ts-ignore
                      const res = await runLoaders({
                        resource: this.resource,
                        loaders: [target]
                        // context: this,
                        // readResource: fss.readFile.bind(fss)
                      })
                      // @ts-ignore
                      return res.result[0] + '\nconst c = 2\nconsole.log(c)'
                    },
                    {
                      ident: 'anotherLoader'
                    }
                  ) as webpack.NormalModule['loaders'][number])
                }
                // console.log(module.loaders)
                // 最后执行
                // module.loaders.unshift(
                //   createLoader(
                //     function (source) {
                //       return source + '\nconst c = 2\nconsole.log(c)'
                //     },
                //     {
                //       ident: 'anotherLoader'
                //     }
                //   ) as webapck.NormalModule['loaders'][number]
                // )
                // 最先执行
                // module.loaders.push(anotherLoader)
              })
            })
          }
        }
      ],
      module: {
        rules: [
          {
            test: /\.js$/i,
            use: [
              {
                ...createLoader(
                  function (source) {
                    return source + '\nconst b = 1\nconsole.log(b)'
                  },
                  {
                    ident: 'hijack'
                  }
                )
              }
            ]
          }
        ]
      }
      // resolve: {}
    })

    const stats = await compile(customCompiler)
    const assets = readAssets(customCompiler, stats)
    expect(assets).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })
})
