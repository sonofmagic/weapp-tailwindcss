const path = require('node:path')
const { defineConfig } = require('@vue/cli-service')
const { WeappTailwindcss } = require('weapp-tailwindcss/webpack')

module.exports = defineConfig({
  outputDir: 'dist/wx',
  pluginOptions: {
    mpx: {
      plugin: {
        postcssInlineConfig: {
          ignoreConfigFile: true,
          plugins: [],
        },
        srcMode: 'wx',
      },
      loader: {},
    },
  },
  configureWebpack(config) {
    config.plugins.push(
      new WeappTailwindcss({
        appType: 'mpx',
        cssOptions: {
          rem2rpx: true,
        },
        cssEntries: [path.resolve(__dirname, 'src/app.css')],
      }),
    )
  },
})
