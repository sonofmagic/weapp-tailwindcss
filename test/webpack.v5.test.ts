import type { Compiler } from 'webpack'
import { UnifiedWebpackPluginV5 } from '@/index'
import { getCompiler5, compile, readAssets, createLoader, getErrors, getWarnings } from './helpers'
import path from 'path'
import postcss from 'postcss'
import fs from 'fs/promises'
import { useStore } from '@/mangle/store'

describe('webpack5 plugin', () => {
  let compiler: Compiler
  let prodCompiler: Compiler
  beforeEach(() => {
    const processor = postcss([
      // require('autoprefixer')(),
      require('tailwindcss')({ config: path.resolve(__dirname, './fixtures/webpack/v5/wxml/tailwind.config.js') })
      // require('postcss-rem-to-responsive-pixel')({
      //   rootValue: 32,
      //   propList: ['*'],
      //   transformUnit: 'rpx'
      // })
    ])
    compiler = getCompiler5({
      mode: 'development',
      entry: {
        wxml: path.resolve(__dirname, './fixtures/webpack/v5/wxml/pages/index.js')
      },
      output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js', // ?var=[fullhash]
        chunkFilename: '[id].[name].js' // ?ver=[fullhash]
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            // https://webpack.js.org/configuration/module/#useentry
            use: createLoader(async function (source) {
              const basename = path.basename(this.resourcePath, path.extname(this.resourcePath))
              const filename = basename + '.wxml'
              const content = await fs.readFile(path.resolve(this.context, filename), {
                encoding: 'utf-8'
              })
              this.emitFile(filename, content)

              const cssFilename = basename + '.css'

              const cssContent = await fs.readFile(path.resolve(this.context, cssFilename), {
                encoding: 'utf-8'
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
          // {
          //   test: /\.css$/,
          //   use: [
          //     createLoader(function (source) {
          //       const basename = path.basename(this.resourcePath, path.extname(this.resourcePath))
          //       const filename = basename + '.css'
          //       this.emitFile(filename, source)
          //       return ''
          //     }),
          //     {
          //       loader: 'postcss-loader',
          //       options: {
          //         postcssOptions: {
          //           plugins: [require('tailwindcss')({ config: path.resolve(__dirname, './fixtures/webpack/v5/wxml/tailwind.config.js') })]
          //         }
          //       }
          //     }
          //   ]
          // },
          // {
          //   test: /\.wxml$/,
          //   use: createLoader(function (source) {
          //     const basename = path.basename(this.resourcePath, path.extname(this.resourcePath))
          //     const filename = basename + '.wxml'
          //     this.emitFile(filename, source)
          //   })
          // }
        ]
      }
    })

    prodCompiler = getCompiler5({
      mode: 'production',
      entry: {
        wxml: path.resolve(__dirname, './fixtures/webpack/v5/wxml/pages/index.js')
      },
      output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js', // ?var=[fullhash]
        chunkFilename: '[id].[name].js' // ?ver=[fullhash]
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            use: createLoader(async function (source) {
              const basename = path.basename(this.resourcePath, path.extname(this.resourcePath))
              const filename = basename + '.wxml'
              const content = await fs.readFile(path.resolve(this.context, filename), {
                encoding: 'utf-8'
              })
              this.emitFile(filename, content)

              const cssFilename = basename + '.css'

              const cssContent = await fs.readFile(path.resolve(this.context, cssFilename), {
                encoding: 'utf-8'
              })

              const res = await processor.process(cssContent, {
                from: undefined,
                map: false
              })
              this.emitFile(cssFilename, res.toString())
              return source
            })
          }
        ]
      }
    })
  })
  it('common', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      customReplaceDictionary: 'complex'
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('unified common', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      }
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('unified prod common', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      }
    }).apply(prodCompiler)

    const stats = await compile(prodCompiler)

    expect(readAssets(prodCompiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('disabled true', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      disabled: true
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('mangle true', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },

      customReplaceDictionary: 'complex',
      mangle: true
    }).apply(compiler)

    const stats = await compile(compiler)
    const { runtimeSet, classGenerator, recorder } = useStore()
    expect(runtimeSet.size).toBeGreaterThan(0)
    expect(recorder.js.length).toBeGreaterThan(0)
    expect(recorder.css.length).toBeGreaterThan(0)
    expect(recorder.wxml.length).toBeGreaterThan(0)
    expect(classGenerator.newClassSize).toBeGreaterThan(0)
    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('mangle options', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      mangle: {
        classGenerator: {
          classPrefix: ''
        }
      },
      customReplaceDictionary: 'complex'
    }).apply(compiler)

    const stats = await compile(compiler)
    const { runtimeSet, classGenerator, recorder } = useStore()
    expect(runtimeSet.size).toBeGreaterThan(0)
    expect(recorder.js.length).toBeGreaterThan(0)
    expect(recorder.css.length).toBeGreaterThan(0)
    expect(recorder.wxml.length).toBeGreaterThan(0)
    expect(classGenerator.newClassSize).toBeGreaterThan(0)
    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })
})
