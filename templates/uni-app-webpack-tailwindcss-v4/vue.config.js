const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const path = require('path')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
    // some option...
    configureWebpack: (config) => {
        config.plugins.push(
            new UnifiedWebpackPluginV5({
                rem2rpx: true,
                cssEntries: [
                    path.relative(__dirname, 'src/main.css')
                ]
            })
        )
    }
    // other option...
}

module.exports = config