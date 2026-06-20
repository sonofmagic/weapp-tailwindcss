import type { UserConfigExport } from '@tarojs/cli'
import { createRequire } from 'node:module'
import { WeappTailwindcss, type UserDefinedOptions } from 'weapp-tailwindcss/webpack'
import devConfig from './dev'
import prodConfig from './prod'

const require = createRequire(__filename)
const bench = require('../../bench.cjs')('taro-react')
const taroEnv = process.env.TARO_ENV
const isWebLikeTarget = taroEnv === 'h5' || taroEnv === 'harmony' || taroEnv === 'harmony-hybrid'

const generator = {
  target: isWebLikeTarget ? 'web' : 'weapp',
  styleOptions: {
    px2rpx: true,
  },
} satisfies UserDefinedOptions['generator']

function disableWebpackDevServerClientOverlay(chain: any) {
  chain.devServer.set('client', {
    ...(chain.devServer.get('client') ?? {}),
    overlay: false,
  })
}

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
  projectName: 'taro-webpack-react-tailwindcss-v3',
  date: '2022-2-5',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-html', '@tarojs/plugin-platform-harmony-hybrid'],
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

      if (taroEnv === 'weapp') {
        // let start
        chain.merge({
          plugin: {
            install: {
              plugin: WeappTailwindcss,
              args: [
                {
                  // onStart() {
                  //   start = performance.now()
                  // },
                  // onEnd() {
                  //   console.log('WeappTailwindcss onEnd:', performance.now() - start, 'ms')
                  // },
                  onStart() {
                    bench.start();
                  },
                  onEnd() {
                    bench.end();
                    bench.dump();
                  },
                  rem2rpx: true,
                  cssSourceTrace: true,
                  generator,
                } satisfies UserDefinedOptions
              ]
              // args: [opt, 'taro']
            }
          }
        })
      }


      // chain
      //   .plugin('WeappTailwindcss')
      //   .use(WeappTailwindcss, [opt])
      // chain
      //   .plugin('WeappTailwindcss')
      //   .use(WeappTailwindcss(opt))

      // if (isWrite) {
      //   opt.loaderOptions = {
      //     jsxRename: {
      //       dir: path.resolve(__dirname, '../../../test/fixtures/loader/taro-webpack-react-tailwindcss-v3')
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
      chain.plugins.delete('webpackbar')
      disableWebpackDevServerClientOverlay(chain)
      chain.merge({
        plugin: {
          install: {
            plugin: WeappTailwindcss,
            args: [
              {
                tailwindcssBasedir: process.cwd(),
                cssSourceTrace: true,
                rem2rpx: true,
                generator,
              } satisfies UserDefinedOptions
            ]
          }
        }
      })
    }
  },
  rn: {
    appName: 'taroDemo',
    postcss: {
      cssModules: {
        enable: false,
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
