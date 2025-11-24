require('./scripts/patch-ajv-keywords')
require('./scripts/patch-chalk')
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const { StyleInjector } = require('weapp-style-injector/webpack/uni-app')
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
        // config.plugins.push(
        //     StyleInjector()
        // )
    },
    chainWebpack(config) {
      config.plugins.delete('fork-ts-checker')
    }
    // other option...
}

module.exports = config
