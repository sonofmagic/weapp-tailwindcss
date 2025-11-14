require('./scripts/patch-ajv-keywords')
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const { StyleInjector } = require('weapp-style-injector/webpack/uni-app')
const { WeappTailwindcssDisabled } = require('./platform')
const bench = require('../bench.cjs')('uni-app-webpack5-vue2')


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
      })
    )
    // config.plugins.push(
    //   StyleInjector()
    // )
    // config.plugins.push(new MiniCssExtractPlugin())
    // smp.wrap(config)
  },
  chainWebpack(config) {
    config.plugins.delete('fork-ts-checker')
    // Work around Promise return from vendor template compiler prettifier in Node 20/22
    // Disable prettify so compiled template code stays synchronous
    try {
      config.module
        .rule('vue')
        .use('vue-loader')
        .tap((options = {}) => {
          options.prettify = false
          return options
        })
    } catch (e) {
      // noop
    }
  }
}

module.exports = config
