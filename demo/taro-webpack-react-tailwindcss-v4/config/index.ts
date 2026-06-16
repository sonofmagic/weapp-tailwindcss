import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import devConfig from './dev'
import prodConfig from './prod'
import { WeappTailwindcss, UserDefinedOptions } from 'weapp-tailwindcss/webpack'

const isWatchRegression = process.env.WEAPP_TW_WATCH_REGRESSION === '1'
const isWatchBuild = process.argv.includes('--watch') || process.argv.includes('-w')
const tailwindcssV4GradientFallback = process.env.WEAPP_TW_V4_GRADIENT_FALLBACK !== '0'

const generator = {
  target: process.env.TARO_ENV === 'h5' || process.env.TARO_ENV === 'harmony' || process.env.TARO_ENV === 'harmony-hybrid'
    ? 'web'
    : 'weapp',
  styleOptions: {
    px2rpx: true,
    tailwindcssV4GradientFallback,
  },
} satisfies UserDefinedOptions['generator']

function applyWatchRegressionAliases(chain: any) {
  if (!isWatchRegression) {
    return
  }
  const nutuiStub = require.resolve('../src/watch-regression/nutui-stub.tsx')
  const nutuiStyleStub = require.resolve('../src/watch-regression/nutui-style-stub.css')
  chain.resolve.alias
    .set('@nutui/nutui-react-taro$', nutuiStub)
    .set('@nutui/icons-react-taro$', nutuiStub)
    .set('@nutui/nutui-react-taro/dist/styles/themes/default.css$', nutuiStyleStub)
    .set('@nutui/nutui-react-taro/dist/style.css$', nutuiStyleStub)
}

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  process.env.BROWSERSLIST_ENV = isWatchBuild
    ? 'development'
    : 'production'

  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'taro-webpack-react-tailwindcss-v4',
    date: '2025-2-23',
    designWidth(input) {
      // 配置 NutUI 375 尺寸
      // @ts-ignore
      if (input?.file?.replace(/\\+/g, '/').indexOf('@nutui') > -1) {
        return 375
      }
      // 全局使用 Taro 默认的 750 尺寸
      return 750
    },
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    plugins: ['@tarojs/plugin-platform-harmony-hybrid'],
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
    framework: 'react',
    compiler: {
      type: 'webpack5',
      prebundle: {
        exclude: ['@nutui/nutui-react-taro', '@nutui/icons-react-taro'],
      },
    },
    cache: {
      enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
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
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        applyWatchRegressionAliases(chain)
        chain.merge({
          plugin: {
            install: {
              plugin: WeappTailwindcss,
              args: [
                {
                  tailwindcssBasedir: process.cwd(),
                  cssSourceTrace: true,
                  rem2rpx: true,
                  tailwindcssV4GradientFallback,
                  generator,
                  // before 2248
                  // after 309
                  // cssCalc: ['--nutui']
                } satisfies UserDefinedOptions
              ]
            }
          }
        })
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
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
      webpackChain(chain) {
        chain.plugins.delete('webpackbar')
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        applyWatchRegressionAliases(chain)
        chain.merge({
          plugin: {
            install: {
              plugin: WeappTailwindcss,
              args: [
                {
                  tailwindcssBasedir: process.cwd(),
                  cssSourceTrace: true,
                  rem2rpx: true,
                  tailwindcssV4GradientFallback,
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
