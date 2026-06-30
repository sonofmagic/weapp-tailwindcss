import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
import { StyleInjector } from 'weapp-style-injector/vite/uni-app'

const require = createRequire(import.meta.url)
const uniMpVueRuntimePath = require.resolve('@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js')
const uniMpVueDir = dirname(uniMpVueRuntimePath)

export default defineConfig({
  plugins: [
    uni(),
    StyleInjector({
      styleEntries: [
        {
          sourceFileName: 'index.css',
        },
        {
          sourceFileName: 'page.css',
          include: ['pages/**/*.css', 'pages/**/*.wxss'],
        },
        {
          sourceFileName: 'scss.scss',
          include: ['pages/**/*.css', 'pages/**/*.wxss'],
        },
        {
          sourceFileName: 'less.less',
          include: ['pages/**/*.css', 'pages/**/*.wxss'],
        },
        {
          sourceFileName: 'component.css',
          include: ['components/**/*.css', 'components/**/*.wxss'],
        },
        {
          sourceFileName: 'weapp.css',
          sourceInclude: ['pages/**/*.weapp.vue'],
        },
        {
          sourceFileName: 'ali.css',
          sourceInclude: ['pages/**/*.ali.vue'],
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js': uniMpVueRuntimePath,
      '@dcloudio/uni-mp-vue': uniMpVueDir,
    },
  },
})
