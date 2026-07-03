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
    // Node 24+ 与 Mpx/Webpack 的 filesystem cache 组合在本地全量 build 中容易拖住进程尾部。
    config.cache = false
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
  chainWebpack(config) {
    config.plugins.delete('fork-ts-checker')
  },
})
