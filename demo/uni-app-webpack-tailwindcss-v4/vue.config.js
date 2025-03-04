const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
    // some option...
    configureWebpack: (config) => {
        config.plugins.push(
            new UnifiedWebpackPluginV5({
                rem2rpx: true
            })
        )
    }
    // other option...
}

module.exports = config