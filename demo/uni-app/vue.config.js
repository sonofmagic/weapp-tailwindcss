const { UniAppWeappTailwindcssWebpackPluginV4 } = require('../..')

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  configureWebpack: {
    plugins: [new UniAppWeappTailwindcssWebpackPluginV4()]
  }
}

module.exports = config
