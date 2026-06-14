import { defineConfig, type UserConfigExport } from '@tarojs/cli'
// import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import devConfig from './dev'
import prodConfig from './prod'
import type { Plugin } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const taroEnv = process.env.TARO_ENV
const isWebLikeTarget = taroEnv === 'h5' || taroEnv === 'harmony' || taroEnv === 'harmony-hybrid'
const isNativeTarget = taroEnv === 'rn' || taroEnv === 'jdrn'

const generator = {
  target: isWebLikeTarget ? 'web' : 'weapp',
  styleOptions: {
    px2rpx: true,
  },
}
console.log(taroEnv)

function taroAlipayBrowserslistAssetPlugin(): Plugin {
  return {
    name: 'taro-alipay-browserslist-asset',
    enforce: 'pre',
    generateBundle(_options, bundle) {
      if (process.env.TARO_ENV !== 'alipay') {
        return
      }
      bundle['.browserslistrc'] = {
        type: 'asset',
        fileName: '.browserslistrc',
        source: 'defaults and fully supports es6-module',
      }
    },
  }
}

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'vite'>(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'taro-vite-react-tailwindcss-v3',
    date: '2024-8-14',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-platform-harmony-hybrid'],
    defineConstants: {
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },

    framework: 'react',
    compiler: {
      type: 'vite',
      vitePlugins: [
        taroAlipayBrowserslistAssetPlugin(),
        {
          name: 'taro-cjs-stability',
          enforce: 'post',
          config() {
            // Taro mini runner 默认启用该选项，关闭后可避免 node_modules 中的 ESM 模块被强制转为 CommonJS。
            return {
              build: {
                commonjsOptions: {
                  transformMixedEsModules: false,
                },
              },
            }
          },
        },
        WeappTailwindcss({
          cssSourceTrace: true,
          rem2rpx: true,
          generator,
          // H5 与 Harmony Hybrid 都走 Web 样式产物；RN 原生 bundle 不处理样式入口。
          disabled: isNativeTarget,
          injectAdditionalCssVarScope: true,
        })
      ] as Plugin[]
    },
    mini: {
      // https://taro-docs.jd.com/docs/config-detail#minipostcss
      postcss: {
        // htmltransform: {
        //   enable: true,
        //   config: {
        //     removeCursorStyle: false,
        //   },
        // },
        pxtransform: {
          enable: true,
          config: {

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


    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',

      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
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
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    }
  }
  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
