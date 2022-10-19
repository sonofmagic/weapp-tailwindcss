import type { Compiler } from 'webpack'
import { BaseJsxWebpackPluginV5 } from '@/index'
import { getCompiler5, compile, readAssets, createLoader, getErrors, getWarnings } from '#test/helpers'
import { webpack5CasePath, rootPath } from '#test/util'
import path from 'path'
// import postcss from 'postcss'
// import fs from 'fs/promises'
const loaderPath = path.resolve(rootPath, 'dist/jsx-rename-loader.js')
describe('webpack5 jsx plugin', () => {
  let compiler: Compiler
  const postcssPlugins = [
    require('autoprefixer')(),
    require('tailwindcss')({ config: path.resolve(__dirname, './config/tailwind.config.js') }),
    require('postcss-rem-to-responsive-pixel')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    })
  ]
  beforeEach(() => {
    // const processor = postcss(postcssPlugins)

    compiler = getCompiler5({
      mode: 'development',
      entry: {
        entry: path.resolve(webpack5CasePath, 'jsx/pages/index.jsx')
      },
      output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js?var=[fullhash]',
        chunkFilename: '[id].[name].js?ver=[fullhash]'
      },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            // https://webpack.js.org/configuration/module/#useentry
            use: [
              createLoader(function (source) {
                return source
              }),
              {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-react']
                }
              }
            ]
          },
          {
            test: /\.css$/i,
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: postcssPlugins
                  }
                }
              }
            ]
          }
        ]
      }
    })
  })
  it('common', async () => {
    new BaseJsxWebpackPluginV5(
      {
        mainCssChunkMatcher(name, appType) {
          return path.basename(name) === 'index.css'
        },
        jsxRenameLoaderPath: loaderPath
      },
      'taro'
    ).apply(compiler)

    const stats = await compile(compiler)
    const assets = readAssets(compiler, stats)
    expect(assets).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('disabled true', async () => {
    new BaseJsxWebpackPluginV5(
      {
        mainCssChunkMatcher(name) {
          return path.basename(name) === 'index.css'
        },
        disabled: true,
        jsxRenameLoaderPath: loaderPath
      },
      'taro'
    ).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })
})
