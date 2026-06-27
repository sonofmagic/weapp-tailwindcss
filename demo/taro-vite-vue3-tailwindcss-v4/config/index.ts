import { resolve } from 'node:path'
import { defineConfig, type UserConfigExport } from '@tarojs/cli'

import devConfig from './dev'
import prodConfig from './prod'
import type { Plugin } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { resolveTaroPlatform } from 'weapp-tailwindcss/framework'

const taroPlatform = resolveTaroPlatform()
const generator = {
  target: taroPlatform.isWeb || process.env.TARO_ENV === 'harmony' || process.env.TARO_ENV === 'harmony-hybrid'
    ? 'web'
    : 'weapp',
  webCompat: taroPlatform.isWeb ? true : undefined,
  styleOptions: {
    px2rpx: true,
  },
}
const cssEntries = [
  resolve(process.cwd(), 'src/app.css'),
  resolve(process.cwd(), 'src/sub-normal/pages/index.css'),
  resolve(process.cwd(), 'src/sub-independent/pages/index.css'),
]

const isNativeTarget = process.env.TARO_ENV === 'rn' || process.env.TARO_ENV === 'jdrn'

const isWatchBuild = process.argv.includes('--watch') || process.argv.includes('-w')
const taroPlugins = [
  ...(process.env.WEAPP_TW_TARO_PLUGIN_HTML === '0' ? [] : ['@tarojs/plugin-html']),
  // '@tarojs/plugin-platform-harmony-hybrid',
]

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
  process.env.BROWSERSLIST_ENV = isWatchBuild
    ? 'development'
    : 'production'

  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'taro-vite-vue3-tailwindcss-v4',
    date: '2025-2-23',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    plugins: taroPlugins,
    sourceRoot: 'src',
    outputRoot: 'dist',
    defineConstants: {
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'vue3',
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
          tailwindcssBasedir: process.cwd(),
          cssSourceTrace: true,
          cssEntries,
          rem2rpx: true,
          generator,
          disabled: isNativeTarget,
          // injectAdditionalCssVarScope: true,
        })
      ]
    },
    mini: {
      postcss: {
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
        },
        // 最简单解决变量的方式，把 enable 设置为 false
        htmltransform: {
          enable: true,
          // config:{
          //   // https://github.com/NervJS/taro/blob/0eddaa86c8115bd99db073c98aca9b3af6031cc7/packages/postcss-html-transform/src/index.ts#L44
          //   removeCursorStyle
          // }
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
