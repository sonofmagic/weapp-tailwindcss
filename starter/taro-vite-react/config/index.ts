import type { UserConfigExport } from '@tarojs/cli'
import type { Plugin } from 'vite'
import path from 'node:path'
import { defineConfig } from '@tarojs/cli'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export default defineConfig<'vite'>(() => {
  return {
    projectName: 'starter-taro-vite-react',
    designWidth: 750,
    deviceRatio: { 640: 2.34 / 2, 750: 1, 375: 2, 828: 1.81 / 2 },
    sourceRoot: 'src',
    outputRoot: 'dist',
    framework: 'react',
    compiler: {
      type: 'vite',
      vitePlugins: [
        WeappTailwindcss({
          cssOptions: {
            rem2rpx: true,
            injectAdditionalCssVarScope: true,
          },
          cssEntries: [path.resolve(__dirname, '../src/app.css')],
        }),
      ] as Plugin[],
    },
  } satisfies UserConfigExport<'vite'>
})
