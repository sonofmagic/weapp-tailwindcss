// 在 vue.config.js 里注册
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  // some option...
  configureWebpack: (config) => {
    config.plugins.push(
      new UnifiedWebpackPluginV5({
        appType: 'uni-app'
      })
    )
  }
  // other option...
}

module.exports = config