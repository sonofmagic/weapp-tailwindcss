import type { UserConfigExport } from '@tarojs/cli'
import path from 'node:path'
import { defineConfig } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { WeappTailwindcss } from 'weapp-tailwindcss/webpack'

const weappTailwindcssOptions = {
  cssOptions: {
    rem2rpx: true,
  },
  cssEntries: [path.resolve(__dirname, '../src/app.css')],
}

function registerWeappTailwindcss(chain: any) {
  chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
  chain.plugin('weapp-tailwindcss').use(WeappTailwindcss, [weappTailwindcssOptions])
}

export default defineConfig<'webpack5'>(() => {
  return {
    projectName: 'starter-taro-webpack-react',
    designWidth: 750,
    deviceRatio: { 640: 2.34 / 2, 750: 1, 375: 2, 828: 1.81 / 2 },
    sourceRoot: 'src',
    outputRoot: 'dist',
    framework: 'react',
    compiler: 'webpack5',
    mini: {
      webpackChain: registerWeappTailwindcss,
    },
    h5: {
      webpackChain: registerWeappTailwindcss,
    },
  } satisfies UserConfigExport<'webpack5'>
})
