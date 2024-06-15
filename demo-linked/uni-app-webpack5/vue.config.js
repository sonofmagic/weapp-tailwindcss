const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const { WeappTailwindcssDisabled } = require('./platform')

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
        },
        tailwindcssBasedir: __dirname
      })
    )
    // config.plugins.push(new MiniCssExtractPlugin())
    // smp.wrap(config)
  }
}

module.exports = config
