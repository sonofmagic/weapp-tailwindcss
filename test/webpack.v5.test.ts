import type { Compiler } from 'webpack'
import { NativeUnpluginWebpack } from '@/index'
import { NativeWeappTailwindcssWebpackPluginV5 } from '#test/archived/base/v5'
import { getCompiler5, compile, readAssets, createLoader, getErrors, getWarnings } from './helpers'
import path from 'path'
import postcss from 'postcss'
import fs from 'fs/promises'

describe('webpack5 plugin', () => {
  let compiler: Compiler
  beforeEach(() => {
    const processor = postcss([
      require('autoprefixer')(),
      require('tailwindcss')({ config: path.resolve(__dirname, './config/tailwind.config.js') }),
      require('postcss-rem-to-responsive-pixel')({
        rootValue: 32,
        propList: ['*'],
        transformUnit: 'rpx'
      })
    ])
    compiler = getCompiler5({
      mode: 'development',
      entry: {
        wxml: path.resolve(__dirname, './fixtures/webpack/v5/wxml/pages/index.js')
      },
      output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js?var=[fullhash]',
        chunkFilename: '[id].[name].js?ver=[fullhash]'
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
              return ''
              // this.emitFile('hello.xx', '12345')
              // console.log()
            })
          }
        ]
      }
    })
  })
  it('common', async () => {
    new NativeWeappTailwindcssWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      }
    }).apply(compiler)

    const stats = await compile(compiler)
    const assets = readAssets(compiler, stats)
    const errors = getErrors(stats)
    const warnings = getWarnings(stats)

    // NativeUnpluginWebpack({
    //   mainCssChunkMatcher(name) {
    //     return path.basename(name) === 'index.css'
    //   }
    // }).apply(compiler)
    // const unistats = await compile(compiler)
    // const uniassets = readAssets(compiler, unistats)
    // const unierrors = getErrors(unistats)
    // const uniwarnings = getWarnings(unistats)
    // expect(stats).toEqual(unistats)
    // expect(assets).toEqual(uniassets)
    // expect(errors).toEqual(unierrors)
    // expect(warnings).toEqual(uniwarnings)
    expect(assets).toMatchSnapshot('assets')
    expect(errors).toMatchSnapshot('errors')
    expect(warnings).toMatchSnapshot('warnings')
    // expect(uniassets).toMatchSnapshot('assets')
    // expect(unierrors).toMatchSnapshot('errors')
    // expect(uniwarnings).toMatchSnapshot('warnings')
  })

  it('[Unplugin] common', async () => {
    NativeUnpluginWebpack({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      }
    }).apply(compiler)
    const unistats = await compile(compiler)
    const uniassets = readAssets(compiler, unistats)
    const unierrors = getErrors(unistats)
    const uniwarnings = getWarnings(unistats)
    expect(uniassets).toMatchSnapshot('assets')
    expect(unierrors).toMatchSnapshot('errors')
    expect(uniwarnings).toMatchSnapshot('warnings')
  })

  it('disabled true', async () => {
    new NativeWeappTailwindcssWebpackPluginV5({
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

  it('[Unplugin] disabled true', async () => {
    NativeUnpluginWebpack({
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
    new NativeWeappTailwindcssWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      mangle: true
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('mangle options', async () => {
    new NativeWeappTailwindcssWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      mangle: {
        ignoreClass: [/^text-/]
      }
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })
})
