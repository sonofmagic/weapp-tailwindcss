const { WeappTailwindcssWebpackPlugin } = require('../..')

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  configureWebpack: {
    plugins: [
      new WeappTailwindcssWebpackPlugin()
    ]
  }
}

module.exports = config
