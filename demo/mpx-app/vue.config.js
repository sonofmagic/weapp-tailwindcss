const { defineConfig } = require('@vue/cli-service')
let Plugin
if (process.env.LOCAL) {
  const { UnifiedWebpackPluginV5 } = require('./weapp-tw-dist')
  Plugin = UnifiedWebpackPluginV5
} else {
  const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin/webpack')
  Plugin = UnifiedWebpackPluginV5
}
// const { MpxWeappTailwindcssWebpackPluginV5 } = require('../..')

module.exports = defineConfig({
  pluginOptions: {
    mpx: {
      srcMode: 'wx',
      plugin: {
        hackResolveBuildDependencies: ({ files, resolveDependencies }) => {
          const path = require('path')
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
    config.plugins.push(new Plugin({
      appType: 'mpx'
    }))
  }
})
