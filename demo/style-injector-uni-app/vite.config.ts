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
      rules: [
        ['index.css', ['pages/**/*.css', 'pages/**/*.wxss', 'components/**/*.css', 'components/**/*.wxss']],
        ['page.css', ['pages/**/*.css', 'pages/**/*.wxss']],
        ['scss.scss', ['pages/**/*.css', 'pages/**/*.wxss']],
        ['less.less', ['pages/**/*.css', 'pages/**/*.wxss']],
        ['component.css', ['components/**/*.css', 'components/**/*.wxss']],
        ['weapp.css', { sourceInclude: ['pages/**/*.weapp.vue'] }],
        ['ali.css', { sourceInclude: ['pages/**/*.ali.vue'] }],
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
