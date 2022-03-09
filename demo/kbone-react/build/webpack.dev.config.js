const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const portfinder = require('portfinder')

const htmlPluginList = Object.keys(baseWebpackConfig.entry).map((name) => {
  return new HtmlWebpackPlugin({
    filename: `${name}.html`,
    template: 'index.html',
    inject: true,
    chunks: [name]
  })
})

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  devServer: {
    historyApiFallback: {
      rewrites: [{ from: /.*/, to: '/index.html' }]
    },
    hot: true,
    compress: true,
    host: process.env.HOST || 'localhost',
    port: +process.env.PORT || 8080,
    open: true, // 自动打开浏览器
    client: {
      logging: 'warn',
      overlay: {
        // 展示全屏报错
        warnings: false,
        errors: true
      }
    },
    static: {
      publicPath: '/'
    },
    proxy: {}
  },
  watchOptions: {
    poll: false
  },
  devtool: 'cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    ...htmlPluginList
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = +process.env.PORT || 8080
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      devWebpackConfig.devServer.port = port

      resolve(devWebpackConfig)
    }
  })
})
