const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const { WeappTailwindcssDisabled } = require('./platform')
const bench = require('../bench')('uni-app-webpack5-vue2')


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
          bench.start()
        },
        onEnd() {
          console.log('UnifiedWebpackPluginV5 onEnd:', performance.now() - start, 'ms')
          bench.end()
          bench.dump()
        },
        rem2rpx: true,
        jsAstTool: bench.useBabel ? 'babel' : 'ast-grep'
      })
    )
    // config.plugins.push(new MiniCssExtractPlugin())
    // smp.wrap(config)
  },
  chainWebpack(config) {
    config.plugins.delete('fork-ts-checker')
  }
}

module.exports = config
