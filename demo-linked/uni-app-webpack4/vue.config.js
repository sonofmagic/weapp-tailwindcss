if (process.env.NODE_ENV === 'development') {
  process.env.TAILWIND_MODE = 'watch'
}
const { UnifiedWebpackPluginV4 } = require('weapp-tailwindcss-webpack-plugin/webpack4')
const { WeappTailwindcssDisabled } = require('./platform')

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  // ....
  configureWebpack: {
    plugins: [
      new UnifiedWebpackPluginV4({
        disabled: WeappTailwindcssDisabled
      })
    ]
  }
  // ....
}

module.exports = config
