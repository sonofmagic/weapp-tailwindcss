const { UniAppWeappTailwindcssWebpackPluginV4 } = require('../..')

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  configureWebpack: {
    plugins: [new UniAppWeappTailwindcssWebpackPluginV4({
      cssPreflight: {
        //"box-sizing": false

      }
    })]
  }
}

module.exports = config
