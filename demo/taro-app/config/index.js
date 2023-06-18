// let TaroWeappTailwindcssWebpackPluginV5
let UnifiedWebpackPluginV5
const path = require('path')
const isLocal = process.env.LOCAL
const isWrite = process.env.WRITE
if (isLocal) {
  console.log('use local built webpack plugin')
  const { UnifiedWebpackPluginV5: plugin } = require('../weapp-tw-dist')
  UnifiedWebpackPluginV5 = plugin
} else {
  const { UnifiedWebpackPluginV5: plugin } = require('weapp-tailwindcss-webpack-plugin/webpack')
  UnifiedWebpackPluginV5 = plugin
}
const config = {
  compiler: {
    prebundle: {
      enable: false,
    },
    type: 'webpack5'
  },
  projectName: 'myApp',
  date: '2022-2-5',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  cache: {
    enable: false
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: ['shadow']
        }
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
      // tailwindcss: {},
      // autoprefixer: {},
    },
    /**
     *
     * @param {import('webpack-chain')} chain
     * @param {import('webpack')} webpack
     */
    webpackChain(chain, webpack) {

      const opt = {
        appType: 'taro',
        minifiedJs: true
        // customAttributes: {
        //   // '*': ['emptyImageClass','btnClassName'],
        //   '*': [/Class/]
        // }
      }
      // chain.module.rules

      // chain.merge({
      //   plugin: {
      //     install: {
      //       plugin: TaroWeappTailwindcssWebpackPluginV5,
      //       args: [opt]
      //     }
      //   }
      // })
      if (process.env.TARO_ENV === 'weapp') {
        chain.merge({
          plugin: {
            install: {
              plugin: UnifiedWebpackPluginV5,
              // args: [opt, 'taro']
            }
          }
        })
      }


      // chain
      //   .plugin('UnifiedWebpackPlugin')
      //   .use(UnifiedWebpackPlugin, [opt])
      // chain
      //   .plugin('UnifiedWebpackPluginV5')
      //   .use(UnifiedWebpackPluginV5(opt))

      // if (isWrite) {
      //   opt.loaderOptions = {
      //     jsxRename: {
      //       dir: path.resolve(__dirname, '../../../test/fixtures/loader/taro-app')
      //     }
      //   }
      // }


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
