// let UniAppWeappTailwindcssWebpackPluginV4
// if (process.env.LOCAL) {
//   console.log('use local built webpack plugin')
//   const { UniAppWeappTailwindcssWebpackPluginV4: plugin } = require('./weapp-tw-dist')
//   UniAppWeappTailwindcssWebpackPluginV4 = plugin
// } else {
//   const { UnifiedWebpackPluginV5: plugin } = require('weapp-tailwindcss-webpack-plugin/webpack')
//   UniAppWeappTailwindcssWebpackPluginV4 = plugin
// }

const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin/webpack')

const { WeappTailwindcssDisabled } = require('./platform')
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
// const smp = new SpeedMeasurePlugin({
//   // outputTarget: './smp.dat',
// })
// const { UniAppWeappTailwindcssWebpackPluginV4 } = require('weapp-tailwindcss-webpack-plugin')
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
        customReplaceDictionary: 'simple',
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
        rem2rpx: true
      })
    )
    // smp.wrap(config)
  }
}

module.exports = config
