import type { UserConfigExport } from '@tarojs/cli'
import { createRequire } from 'node:module'
import { UnifiedWebpackPluginV5, type UserDefinedOptions } from 'weapp-tailwindcss/webpack'
import devConfig from './dev'
import prodConfig from './prod'

const require = createRequire(__filename)
const bench = require('../../bench.cjs')('taro-vue3')
const isWatchRegression = process.env.WEAPP_TW_WATCH_REGRESSION === '1'
const generator = {
  target: process.env.TARO_ENV === 'h5' ? 'web' : 'weapp',
  styleOptions: {
    px2rpx: true,
  },
} satisfies UserDefinedOptions['generator']

const config: UserConfigExport<'webpack5'> = {
  compiler: {
    prebundle: {
      enable: false,
    },
    type: 'webpack5'
  },
  cache: {
    enable: false
  },
  projectName: 'taro-webpack-vue3-tailwindcss-v3',
  date: '2022-2-5',
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
  framework: 'vue3',
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
    webpackChain(chain) {
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
        // let start
        chain.merge({
          plugin: {
            install: {
              plugin: UnifiedWebpackPluginV5,
              args: [
                {
                  // onStart() {
                  //   start = performance.now()
                  // },
                  // onEnd() {
                  //   console.log('UnifiedWebpackPluginV5 onEnd:', performance.now() - start, 'ms')
                  // },
                  onStart() {
                    bench.start();
                  },
                  onEnd() {
                    bench.end();
                    bench.dump();
                  },
                  rem2rpx: true,
                  generator,
                } satisfies UserDefinedOptions
              ]
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
      //       dir: path.resolve(__dirname, '../../../test/fixtures/loader/taro-webpack-vue3-tailwindcss-v3')
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
    },
    webpackChain(chain) {
      if (isWatchRegression) {
        chain.plugins.delete('webpackbar')
      }
    }
  }
}

export default function configFactory(merge: (...configs: UserConfigExport<'webpack5'>[]) => UserConfigExport<'webpack5'>) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, devConfig)
  }
  return merge({}, config, prodConfig)
}
