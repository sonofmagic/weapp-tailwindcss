import path from 'node:path'
import { fileURLToPath } from 'node:url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import { createWebDemoWeappTailwindcssWebpackPlugin } from '../shared/webpack-plugin-target.mjs'

const root = path.dirname(fileURLToPath(import.meta.url))

export default {
  entry: './src/main.ts',
  output: {
    path: path.join(root, process.env.WEBPACK_DIST ?? 'dist'),
    filename: 'assets/[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.vue', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/i,
        loader: 'vue-loader',
      },
      {
        test: /\.ts$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-typescript', { allExtensions: true }],
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'assets/[name].css',
    }),
    createWebDemoWeappTailwindcssWebpackPlugin(),
  ],
  optimization: {
    minimize: false,
  },
  devServer: {
    host: '127.0.0.1',
    hot: true,
    client: {
      overlay: false,
    },
  },
}
