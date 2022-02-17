const { TaroWeappTailwindcssWebpackPluginV4 } = require('../../')

module.exports = {
  one: true,
  output: 'dist/' + process.env.REMAX_PLATFORM,
  configWebpack ({ config, webpack, addCSSRule }) {
    config.plugin('TaroWeappTailwindcssWebpackPluginV4').use(TaroWeappTailwindcssWebpackPluginV4)
  }
}
