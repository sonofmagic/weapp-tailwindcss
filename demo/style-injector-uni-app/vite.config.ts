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
      subPackages: {
        pagesJsonPath: 'src/pages.json',
        indexFileName: 'index.css',
        preprocess: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js': uniMpVueRuntimePath,
      '@dcloudio/uni-mp-vue': uniMpVueDir,
    },
  },
})
