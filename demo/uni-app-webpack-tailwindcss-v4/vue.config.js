const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
    // some option...
    configureWebpack: (config) => {
        config.plugins.push(
            new UnifiedWebpackPluginV5({
                rem2rpx: true,
            })
        )
    },
    chainWebpack(config) {
      config.plugins.delete('fork-ts-checker')
    }
    // other option...
}

module.exports = config
