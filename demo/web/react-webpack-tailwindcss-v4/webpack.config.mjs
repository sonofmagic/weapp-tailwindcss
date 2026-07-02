import path from 'node:path'
import { fileURLToPath } from 'node:url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { createWebDemoWeappTailwindcssWebpackPlugin } from '../shared/webpack-plugin-target.mjs'

const root = path.dirname(fileURLToPath(import.meta.url))

export default {
  entry: './src/main.tsx',
  output: {
    path: path.join(root, process.env.WEBPACK_DIST ?? 'dist'),
    filename: 'assets/[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
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
    new MiniCssExtractPlugin({
      filename: 'assets/[name].css',
    }),
    createWebDemoWeappTailwindcssWebpackPlugin(root),
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
