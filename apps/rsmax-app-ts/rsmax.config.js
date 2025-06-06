const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')

module.exports = {
  configWebpack({ config, webpack, addCSSRule }) {
    config.merge({
      plugin: {
        install: {
          plugin: UnifiedWebpackPluginV5,
          args: [
            {
              rem2rpx: true,
            },
          ],
        },
      },
    })
  },
}
