const { defineConfig } = require('@vue/cli-service')
const { WeappTailwindcss } = require('weapp-tailwindcss/webpack')
const { resolveMpxPlatform } = require('weapp-tailwindcss/framework')
const path = require('path')
const { createOfficialPostcssParityPlugins, createOfficialPostcssParityPostcssOptions } = require('../official-postcss-parity-plugin.cjs')
const projectRoot = __dirname
const officialPostcssParity = process.env.WEAPP_TW_OFFICIAL_POSTCSS_PARITY === '1'

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
  outputDir: `dist/${resolveMpxPlatform().normalized}`,
  pluginOptions: {
    mpx: {
      plugin: {
        postcssInlineConfig: {
          ignoreConfigFile: true,
          plugins: createOfficialPostcssParityPlugins()
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
    // Node 24 + Mpx/Webpack 5 的 filesystem cache 快照 hash 会命中 undefined 输入。
    config.cache = false
    config.plugins.push(
      new WeappTailwindcss({
        appType: 'mpx',
        tailwindcssBasedir: projectRoot,
        cssSourceTrace: true,
        rem2rpx: true,
        generator: officialPostcssParity ? false : undefined,
        postcssOptions: createOfficialPostcssParityPostcssOptions(),
        cssEntries: [
          path.resolve(projectRoot, 'src/app.css'),
          path.resolve(projectRoot, 'src/sub-normal/index.css'),
          path.resolve(projectRoot, 'src/sub-independent/index.css'),
        ],
        styleInjector: false,
      }),
    )
  },
  chainWebpack(config) {
    config.plugins.delete('fork-ts-checker')
  }
})
