import type { Compiler } from 'webpack'
import { NativeWeappTailwindcssWebpackPluginV5 } from '@/index'
import { getCompiler5, compile, readAssets, createLoader } from './helpers'
import path from 'path'

describe('webpack5 plugin', () => {
  let compiler: Compiler
  beforeEach(() => {
    compiler = getCompiler5({
      mode: 'development',
      entry: {
        wxml: path.resolve(__dirname, './fixtures/webpack/v5/wxml/index.js')
      },
      output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js?var=[fullhash]',
        chunkFilename: '[id].[name].js?ver=[fullhash]'
      },
      module: {
        rules: [
          {
            test: /\.shit$/,
            // https://webpack.js.org/configuration/module/#useentry
            use: createLoader(function (source) {
              this.emitFile('hello.xx', '12345')
              console.log(this.resourcePath)
            })
          }
        ]
      }
    })
  })
  it('common', async () => {
    new NativeWeappTailwindcssWebpackPluginV5().apply(compiler)

    const stats = await compile(compiler)
    const res = readAssets(compiler, stats)
    console.log(res)
    // console.log(stats)
  })
})
