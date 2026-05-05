const { defineConfig } = require('@vue/cli-service')
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const tailwindPostcss = require('@tailwindcss/postcss')
const path = require('path')

// 修复 @mpxjs/webpack-plugin 序列化器重复注册导致的构建失败
// 该问题在 pnpm + webpack5 环境下，模块从不同路径被加载两次时触发
const ObjectMiddleware = require('webpack/lib/serialization/ObjectMiddleware')
const originalRegister = ObjectMiddleware.register
ObjectMiddleware.register = function safeRegister(Constructor, request, name, serializer) {
  try {
    return originalRegister.call(this, Constructor, request, name, serializer)
  }
  catch (err) {
    if (err && err.message && err.message.includes('is already registered')) {
      return
    }
    throw err
  }
}

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
