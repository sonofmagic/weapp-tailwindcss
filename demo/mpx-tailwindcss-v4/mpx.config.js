const { defineConfig } = require('@vue/cli-service')
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const tailwindPostcss = require('@tailwindcss/postcss')
const path = require('path')

module.exports = defineConfig({
  outputDir: `dist/${process.env.MPX_CURRENT_TARGET_MODE}`,
  pluginOptions: {
    mpx: {
      plugin: {
        postcssInlineConfig: {
          ignoreConfigFile: true,
          plugins: [
            tailwindPostcss()
          ]
        },
        srcMode: 'wx',
        hackResolveBuildDependencies: ({ files, resolveDependencies }) => {
          const packageJSONPath = path.resolve('package.json')
          if (files.has(packageJSONPath)) files.delete(packageJSONPath)
          if (resolveDependencies.files.has(packageJSONPath)) {
            resolveDependencies.files.delete(packageJSONPath)
          }
        }
      },
      loader: {}
    }
  },
  /**
   * 如果希望node_modules下的文件时对应的缓存可以失效，
   * 可以将configureWebpack.snap.managedPaths修改为 []
   */
  configureWebpack(config) {
    config.plugins.push(
      new UnifiedWebpackPluginV5({
        rem2rpx: true,
        appType: 'mpx',
        cssEntries: [
          path.resolve(__dirname, 'src/app.css')
        ]
      })
    )
  },
  chainWebpack(config) {
    config.plugins.delete('fork-ts-checker')
  }
})
