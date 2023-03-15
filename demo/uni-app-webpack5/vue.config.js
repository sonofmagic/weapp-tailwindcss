let UniAppWeappTailwindcssWebpackPluginV5
if (process.env.LOCAL) {
  console.log('use local built webpack plugin')
  const { UniAppWeappTailwindcssWebpackPluginV5: plugin } = require('./weapp-tw-dist')
  UniAppWeappTailwindcssWebpackPluginV5 = plugin
} else {
  const { UniAppWeappTailwindcssWebpackPluginV5: plugin } = require('weapp-tailwindcss-webpack-plugin')
  UniAppWeappTailwindcssWebpackPluginV5 = plugin
}
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { WeappTailwindcssDisabled } = require('./platform')
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
// const smp = new SpeedMeasurePlugin({
//   // outputTarget: './smp.dat',
// })
// const { UniAppWeappTailwindcssWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  transpileDependencies: ['uview-ui'],
  configureWebpack: (config) => {
    config.plugins.push(
      new UniAppWeappTailwindcssWebpackPluginV5({
        disabled: WeappTailwindcssDisabled
      })
    )
    // config.plugins.push(new MiniCssExtractPlugin())
    // smp.wrap(config)
  }
}

module.exports = config
