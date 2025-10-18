const { resolve } = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MinaWebpackPlugin = require('./plugin/MinaWebpackPlugin')
const MinaRuntimePlugin = require('./plugin/MinaRuntimePlugin')
const LodashWebpackPlugin = require('lodash-webpack-plugin')
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const debuggable = process.env.BUILD_TYPE !== 'release'

/** @type {import('webpack').Configuration} */
module.exports = {
  context: resolve('src'),
  entry: { main: './app.js' },
  output: {
    path: resolve('dist'),
    filename: '[name].js',
    publicPath: resolve('dist'),
    globalObject: 'wx',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      // 记得配置 alias 不然 import Message from 'tdesign-miniprogram/message/index' 会找不到路径
      'tdesign-miniprogram': resolve('./dist/miniprogram_npm/tdesign-miniprogram/'),
    },
  },
  cache: {
    type: 'filesystem',
    cacheDirectory: resolve(__dirname, './node_modules/.cache/webpack'),
    buildDependencies: {
      config: [__filename],
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.(scss)$/,
        include: /src/,
        use: [
          {
            loader: 'file-loader',
            options: {
              useRelativePath: true,
              name: '[path][name].wxss',
              context: resolve('src'),
            },
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: { includePaths: [resolve('src', 'styles'), resolve('src')] },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: ['**/*', '!miniprogram_npm/**'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          to: './',
          filter: resourcePath => !['.ts', '.js', '.scss'].some(item => resourcePath.endsWith(item)),
        },
      ],
    }),
    new MinaWebpackPlugin({
      scriptExtensions: ['.ts', '.js'],
      assetExtensions: ['.scss'],
    }),
    new MinaRuntimePlugin(),
    new LodashWebpackPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      BUILD_TYPE: 'debug',
    }),
    new UnifiedWebpackPluginV5({
      customAttributes: {
        // 只对 t-button 标签生效
        't-button': ['t-class', 't-class-icon', 't-class-loading'],
        // '*' 代表对所有的标签生效
        // '*': ['t-class', 't-class-icon', 't-class-loading'],
      },
      rem2rpx: true,
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'common',
      minChunks: 2,
      minSize: 0,
    },
    runtimeChunk: {
      name: 'runtime',
    },
  },
  mode: debuggable ? 'none' : 'production',
  devtool: debuggable ? 'inline-source-map' : 'source-map',
}
