import * as path from 'path'
import * as webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
// in case you run into any typescript error when configuring `devServer`
import 'webpack-dev-server'

// import { WeappTailwindcssWebpackPluginV5 } from '../../'

import { RemaxWeappTailwindcssWebpackPluginV4, TaroWeappTailwindcssWebpackPluginV4, UniAppWeappTailwindcssWebpackPluginV4 } from 'weapp-tailwindcss-webpack-plugin'

const config: webpack.Configuration = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  devServer: {},
  devtool: false,
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'postcss-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // filename: '[name].css'
    }),
    new HtmlWebpackPlugin()
    // @ts-ignore
    // new WeappTailwindcssWebpackPluginV5()
  ]
}

export default config
