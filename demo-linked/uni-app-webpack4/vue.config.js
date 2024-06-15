if (process.env.NODE_ENV === 'development') {
  process.env.TAILWIND_MODE = 'watch'
}
const { UnifiedWebpackPluginV4 } = require('weapp-tailwindcss/webpack4')
const { WeappTailwindcssDisabled } = require('./platform')

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  // ....
  configureWebpack: {
    plugins: [
      new UnifiedWebpackPluginV4({
        disabled: WeappTailwindcssDisabled,
        rem2rpx: true,
        tailwindcssBasedir: __dirname
      })
    ]
  }
  // ....
}

module.exports = config
