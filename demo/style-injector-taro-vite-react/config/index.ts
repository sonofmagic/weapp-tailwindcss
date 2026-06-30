import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import { StyleInjector } from 'weapp-style-injector/vite/taro'
import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig<'vite'>(async (merge) => {
  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'style-injector-taro-vite-react',
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
      type: 'vite',
      vitePlugins: [
        StyleInjector({
          styleEntries: [
            {
              sourceFileName: 'index.css',
            },
            {
              sourceFileName: 'scss.scss',
              include: ['pages/**/*.css', 'pages/**/*.wxss'],
            },
            {
              sourceFileName: 'less.less',
              include: ['pages/**/*.css', 'pages/**/*.wxss'],
            },
          ],
        }),
      ],
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
    },
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
