const TerserPlugin = require('terser-webpack-plugin')

/**
 * Webpack/Rspack 默认使用 Terser 压缩。
 * 通过 keep_fnames/keep_classnames 确保 weappTwIgnore/twMerge 等名字不被混淆。
 */
module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            keep_fnames: true,
          },
          mangle: {
            keep_fnames: true,
            keep_classnames: true,
          },
        },
      }),
    ],
  },
}
