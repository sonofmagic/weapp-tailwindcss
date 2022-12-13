const { defineConfig } = require('@vue/cli-service')
const { MpxWeappTailwindcssWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')
module.exports = defineConfig({
  pluginOptions: {
    mpx: {
      srcMode: 'wx',
      plugin: {},
      loader: {}
    }
  },
  configureWebpack(config) {
    config.plugins.push(new MpxWeappTailwindcssWebpackPluginV5())
  }
})
