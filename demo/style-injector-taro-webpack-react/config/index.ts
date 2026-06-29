import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { StyleInjector } from 'weapp-style-injector/webpack/taro'
import devConfig from './dev'
import prodConfig from './prod'

function installStyleInjector(chain: any) {
  chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
  chain.merge({
    plugin: {
      styleInjector: {
        plugin: StyleInjector,
        args: [
          {
            subPackages: {
              appConfigPath: 'src/app.config.ts',
              sourceFileName: 'index.css',
              preprocess: false,
            },
          },
        ],
      },
    },
  })
}

export default defineConfig<'webpack5'>(async (merge) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'style-injector-taro-webpack-react',
    date: '2026-06-29',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    framework: 'react',
    compiler: {
      type: 'webpack5',
    },
    cache: {
      enable: false,
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
      webpackChain: installStyleInjector,
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css',
      },
      postcss: {
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
      webpackChain: installStyleInjector,
    },
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
