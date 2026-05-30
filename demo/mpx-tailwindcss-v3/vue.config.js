const { defineConfig } = require('@vue/cli-service')
const { WeappTailwindcss } = require('weapp-tailwindcss/webpack')
const bench = require('../bench.cjs')('mpx')
const autoprefixer = require('autoprefixer')
const path = require('node:path')

const isWatchRegression = process.env.WEAPP_TW_WATCH_REGRESSION === '1'

module.exports = defineConfig({
  pluginOptions: {
    mpx: {
      srcMode: 'wx',
      plugin: {
        postcssInlineConfig: {
          ignoreConfigFile: true,
          plugins: [
            autoprefixer({ remove: false })
          ]
        },
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
    let start
    if (isWatchRegression) {
      config.resolve ??= {}
      config.resolve.alias ??= {}
      const componentStub = path.resolve(__dirname, 'src/watch-regression/component-stub.mpx')
      config.resolve.alias['tdesign-miniprogram/button/button'] = componentStub
      config.resolve.alias['@vant/weapp/button/index'] = componentStub
    }
    config.plugins.push(new WeappTailwindcss({
      onStart() {
        // start = performance.now()
        bench.start()
      },
      onEnd() {
        bench.end()
        bench.dump()
        // console.log('WeappTailwindcss onEnd:', performance.now() - start, 'ms')
      },
      rem2rpx: true,
      appType: 'mpx'
    }))
  },
  chainWebpack(config) {
    if (isWatchRegression) {
      config.plugins.delete('fork-ts-checker')
    }
  }
})
