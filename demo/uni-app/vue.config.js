const { UniAppWeappTailwindcssWebpackPluginV4 } = require('../..')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin({
  //outputTarget: './smp.dat',
})
// const { UniAppWeappTailwindcssWebpackPluginV4 } = require('weapp-tailwindcss-webpack-plugin')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  configureWebpack: (config) => {
    smp.wrap(config)
  },
  chainWebpack: (config) => {
    config.plugin('UniAppWeappTailwindcssWebpackPluginV4').use(UniAppWeappTailwindcssWebpackPluginV4).end()
  }
}

module.exports = config
