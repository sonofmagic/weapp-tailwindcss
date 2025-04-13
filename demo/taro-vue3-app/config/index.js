const path = require('path')
const bench = require('../../bench')('taro-vue3')
const isLocal = process.env.LOCAL
const isWrite = process.env.WRITE
import ComponentsPlugin from 'unplugin-vue-components/webpack'
import NutUIResolver from '@nutui/nutui-taro/dist/resolver'
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')

const config = {
  projectName: 'taro-vue3-app',
  date: '2022-2-11',
  // designWidth: 750,
  designWidth(input) {
    // 配置 NutUI 375 尺寸
    if (input?.file?.replace(/\\+/g, '/').indexOf('@nutui') > -1) {
      return 375
    }
    // 全局使用 Taro 默认的 750 尺寸
    return 750
  },
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  // 开启 HTML 插件
  plugins: ['@tarojs/plugin-html'],
  sass: {
    data: `@import "@nutui/nutui-taro/dist/styles/variables.scss";`,
  },
  defineConstants: {},
  cache: {
    enable: true
  },
  copy: {
    patterns: [],
    options: {}
  },
  compiler: 'webpack5',
  framework: 'vue3',
  mini: {
    postcss: {
      // htmltransform: {
      //   enable: true,
      //   config: {
      //     removeCursorStyle: false,
      //   }
      // },
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain, webpack) {
      chain.plugin('unplugin-vue-components').use(ComponentsPlugin({
        resolvers: [NutUIResolver({ taro: true })]
      }))
      let start
      const opt = {
        injectAdditionalCssVarScope: true,
        onStart() {
          start = performance.now()
          bench.start()
        },
        onEnd() {
          console.log('UnifiedWebpackPluginV5 onEnd:', performance.now() - start, 'ms')
          bench.end()
          bench.dump()
        },
        rem2rpx: true,
      }
      // if (isWrite) {
      //   opt.loaderOptions = {
      //     jsxRename: {
      //       dir: path.resolve(__dirname, '../../../test/fixtures/loader/taro-vue3-app')
      //     }
      //   }
      // }
      chain.merge({
        plugin: {
          install: {
            plugin: UnifiedWebpackPluginV5,
            args: [opt]
          }
        }
      })
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      chain.plugin('unplugin-vue-components').use(ComponentsPlugin({
        resolvers: [NutUIResolver({ taro: true })]
      }))
    },
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
