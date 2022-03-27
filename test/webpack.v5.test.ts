import type { Compiler } from 'webpack'
import { NativeWeappTailwindcssWebpackPluginV5 } from '@/index'
import { getCompiler5, compile, readAssets, createLoader, getErrors, getWarnings } from './helpers'
import path from 'path'
import postcss from 'postcss'
import fs from 'fs/promises'

const processor = postcss([
  require('autoprefixer')(),
  require('tailwindcss')({ config: path.resolve(__dirname, './config/tailwind.config.js') }),
  require('postcss-rem-to-responsive-pixel')({
    rootValue: 32,
    propList: ['*'],
    transformUnit: 'rpx'
  })
])
describe('webpack5 plugin', () => {
  let compiler: Compiler
  beforeEach(() => {
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
      mainCssChunkMatcher (name) {
        return path.basename(name) === 'index.css'
      }
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })
})
