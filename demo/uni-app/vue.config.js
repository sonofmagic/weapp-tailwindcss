let UniAppWeappTailwindcssWebpackPluginV4
if (process.env.LOCAL) {
  console.log('use local built webpack plugin')
  const { UniAppWeappTailwindcssWebpackPluginV4: plugin } = require('./weapp-tw-dist')
  UniAppWeappTailwindcssWebpackPluginV4 = plugin
} else {
  const { UnifiedWebpackPluginV5: plugin } = require('weapp-tailwindcss-webpack-plugin/webpack')
  UniAppWeappTailwindcssWebpackPluginV4 = plugin
}

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
    config.plugins.push(
      new UniAppWeappTailwindcssWebpackPluginV4({
        jsMatcher: (file) => {
          if (file.includes('node_modules')) {
            return false
          }
          // remove jsx tsx ts case
          return /.+\.[cm]?[j]s?$/.test(file)
        },
        disabled: WeappTailwindcssDisabled,
        customAttributes: {
          // '*': [/className/],
          '*': ['className']
        },
        customReplaceDictionary: 'simple'
      })
    )
    // smp.wrap(config)
  }
}

module.exports = config
