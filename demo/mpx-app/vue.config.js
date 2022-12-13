const { defineConfig } = require('@vue/cli-service')
// const { MpxWeappTailwindcssWebpackPluginV5 } = require('../..')

const { MpxWeappTailwindcssWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')
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
    config.plugins.push(new MpxWeappTailwindcssWebpackPluginV5())

    // config.plugins.push(function (compiler) {
    //   compiler.hooks.compilation.tap('xxxxxx', (compilation, params) => {
    //     console.log(compilation, params)
    //   })
    // })
  }
})
