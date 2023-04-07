import type { Compiler } from 'webpack'
import { BaseJsxWebpackPluginV5 } from '@/index'
import { getCompiler5, compile, readAssets, createLoader, getErrors, getWarnings } from '#test/helpers'
import { webpack5CasePath, rootPath } from '#test/util'
import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
// import postcss from 'postcss'
// import fs from 'fs/promises'
const loaderPath = path.resolve(rootPath, 'dist/jsx-rename-loader.js')
describe('webpack5 jsx plugin', () => {
  let compiler: Compiler
  const postcssPlugins = [
    require('autoprefixer')(),
    require('tailwindcss')({
      theme: {
        extend: {}
      },
      plugins: [],
      corePlugins: {
        preflight: false
      },
      content: [path.resolve(webpack5CasePath, 'jsx/**/*.jsx')]
    }),
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
      context: path.resolve(webpack5CasePath, 'jsx'),
      entry: {
        entry: './pages/index.jsx'
      },
      output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
        chunkFilename: '[id].[name].js'
      },
      plugins: [new MiniCssExtractPlugin()],
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
              MiniCssExtractPlugin.loader,
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
      },
      externals: ['react', 'react-dom']
    })
  })
  it('common', async () => {
    new BaseJsxWebpackPluginV5(
      {
        mainCssChunkMatcher(name, appType) {
          return true // return path.basename(name) === 'index.css'
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
    const assets = readAssets(compiler, stats)
    expect(assets).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })
})
