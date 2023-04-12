const { defineConfig } = require('@vue/cli-service')
let Plugin
if (process.env.LOCAL) {
  const { UnifiedWebpackPluginV5 } = require('./weapp-tw-dist')
  Plugin = UnifiedWebpackPluginV5
} else {
  const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')
  Plugin = UnifiedWebpackPluginV5
}
// const { MpxWeappTailwindcssWebpackPluginV5 } = require('../..')

module.exports = defineConfig({
  pluginOptions: {
    mpx: {
      srcMode: 'wx',
      plugin: {
        // writeMode: 'full',
        // postcssInlineConfig: {
        //   plugins: [
        //     require('tailwindcss')(),
        //     require('autoprefixer')({ remove: false })
        //   ]
        // }
      },
      loader: {}
    }
  },
  configureWebpack(config) {
    // console.log(config.module.rules)
    // @ts-ignore
    config.plugins.push(new Plugin({
      appType: 'mpx'
    }))

    // config.plugins.push(function (compiler) {
    //   compiler.hooks.compilation.tap('xxxxxx', (compilation, params) => {
    //     console.log(compilation, params)
    //   })
    // })
  }
})
