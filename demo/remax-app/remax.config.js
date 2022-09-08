let RemaxWeappTailwindcssWebpackPluginV4
if (process.env.LOCAL) {
  console.log('use local built webpack plugin')
  const { RemaxWeappTailwindcssWebpackPluginV4: plugin } = require('../../')
  RemaxWeappTailwindcssWebpackPluginV4 = plugin
} else {
  const { RemaxWeappTailwindcssWebpackPluginV4: plugin } = require('weapp-tailwindcss-webpack-plugin')
  RemaxWeappTailwindcssWebpackPluginV4 = plugin
}

module.exports = {
  one: true,
  output: 'dist/' + process.env.REMAX_PLATFORM,
  configWebpack({ config, webpack, addCSSRule }) {
    config.plugin('RemaxWeappTailwindcssWebpackPluginV4').use(RemaxWeappTailwindcssWebpackPluginV4, [
      {
        // cssPreflight: {
        //   'box-sizing': false
        // }
      }
    ])
  }
}
