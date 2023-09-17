let UnifiedWebpackPluginV5
if (process.env.LOCAL) {
  console.log('use local built webpack plugin')
  const { UnifiedWebpackPluginV5: plugin } = require('./weapp-tw-dist')
  UnifiedWebpackPluginV5 = plugin
} else {
  const { UnifiedWebpackPluginV5: plugin } = require('weapp-tailwindcss-webpack-plugin/webpack')
  UnifiedWebpackPluginV5 = plugin
}
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { WeappTailwindcssDisabled } = require('./platform')
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
// const smp = new SpeedMeasurePlugin({
//   // outputTarget: './smp.dat',
// })
// const { UniAppWeappTailwindcssWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')

let start
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  transpileDependencies: ['uview-ui'],
  configureWebpack: (config) => {
    config.plugins.push(
      new UnifiedWebpackPluginV5({
        disabled: WeappTailwindcssDisabled,
        appType: 'uni-app',
        wxsMatcher() {
          return false
        },
        inlineWxs: false,
        onStart() {
          start = performance.now()
        },
        onEnd() {
          console.log('UnifiedWebpackPluginV5 onEnd:', performance.now() - start, 'ms')
        }
      })
    )
    // config.plugins.push(new MiniCssExtractPlugin())
    // smp.wrap(config)
  }
}

module.exports = config
