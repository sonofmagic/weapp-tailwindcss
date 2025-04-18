const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const bench = require('../bench')('uni-app-webpack-vue2')
const { WeappTailwindcssDisabled } = require('./platform')

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  transpileDependencies: ['uview-ui'],
  configureWebpack: (config) => {
    // let now
    let start
    config.plugins.push(
      new UnifiedWebpackPluginV5({
        jsMatcher: (file) => {
          if (file.includes('node_modules')) {
            return false
          }
          // remove jsx tsx ts case
          return /.+\.[cm]?js?$/.test(file)
        },
        disabled: WeappTailwindcssDisabled,
        customAttributes: {
          // '*': [/className/],
          '*': ['className']
        },
        wxsMatcher() {
          return false
        },
        inlineWxs: false,
        onStart() {
          bench.start()
          start = performance.now()
        },
        onEnd() {
          bench.end()
          bench.dump()
          console.log('UnifiedWebpackPluginV5 onEnd:', performance.now() - start, 'ms')
        },
        rem2rpx: true,
      })
    )
    // smp.wrap(config)
  }
}

module.exports = config
