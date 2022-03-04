const { RemaxWeappTailwindcssWebpackPluginV4 } = require('../../')

module.exports = {
  one: true,
  output: 'dist/' + process.env.REMAX_PLATFORM,
  configWebpack({ config, webpack, addCSSRule }) {
    config.plugin('RemaxWeappTailwindcssWebpackPluginV4').use(RemaxWeappTailwindcssWebpackPluginV4, [{
      // cssPreflight: {
      //   'box-sizing': false
      // }
    }])
  }
}
