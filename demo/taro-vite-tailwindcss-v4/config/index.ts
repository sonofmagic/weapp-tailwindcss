import { defineConfig, type UserConfigExport } from '@tarojs/cli'

import devConfig from './dev'
import prodConfig from './prod'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import tailwindcss from '@tailwindcss/postcss'
// import tailwindcss from '@tailwindcss/vite'

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'vite'>(async (merge, { command, mode }) => {
  // const { default: tailwindcss } = await import('@tailwindcss/vite')

  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'taro-vite-tailwindcss-v4',
    date: '2025-2-23',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    // plugins: ['@tarojs/plugin-html'],
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
        //  No "exports" main defined
        // tailwindcss(),
        {
          name: 'postcss-config-loader-plugin',
          config(config) {
            // 加载 tailwindcss
            if (typeof config.css?.postcss === 'object') {
              // @ts-ignore
              config.css?.postcss.plugins?.unshift(tailwindcss())
            }
          },
        },
        UnifiedViteWeappTailwindcssPlugin({
          rem2rpx: true,
          injectAdditionalCssVarScope: true,
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

  process.env.BROWSERSLIST_ENV = process.env.NODE_ENV

  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
