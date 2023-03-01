let TaroWeappTailwindcssWebpackPluginV5
const path = require('path')
const isLocal = process.env.LOCAL
const isWrite = process.env.WRITE
if (isLocal) {
  console.log('use local built webpack plugin')
  const { TaroUnpluginWebpack: plugin } = require('../../../')
  TaroWeappTailwindcssWebpackPluginV5 = plugin
} else {
  const { TaroWeappTailwindcssWebpackPluginV5: plugin } = require('weapp-tailwindcss-webpack-plugin')
  TaroWeappTailwindcssWebpackPluginV5 = plugin
}
const config = {
  projectName: 'taro-vue2-app',
  date: '2022-2-11',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'vue',
  compiler: 'webpack5',
  cache: {
    enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  mini: {
    postcss: {
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
      const opt = {
        framework: 'vue2'
      }
      if (isWrite) {
        opt.loaderOptions = {
          jsxRename: {
            dir: path.resolve(__dirname, '../../../test/fixtures/loader/taro-vue2-app')
          }
        }
      }
      chain.merge({
        plugin: {
          install: {
            plugin: TaroWeappTailwindcssWebpackPluginV5,
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
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
