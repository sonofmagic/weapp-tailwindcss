import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import uni from '@dcloudio/vite-plugin-uni'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'
import { WeappTailwindcssDisabled } from './platform'
import postcssPlugins from './postcss.config.cjs'

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const mpWeixinDir = dirname(
  require.resolve('@dcloudio/uni-mp-weixin/package.json', { paths: [here] }),
)
// Resolve vue runtime from the same version bundled with mp-weixin to avoid older 2.x builds lacking findComponentPropsData
const uniMpVueRuntimePath = require.resolve('@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js', {
  paths: [mpWeixinDir, here],
})
const uniMpVueDir = dirname(uniMpVueRuntimePath)

// https://vitejs.dev/config/
export default defineConfig({
  // uvtw 一定要放在 uni 后面
  plugins: [
    {
      name: 'force-uni-mp-vue-runtime',
      enforce: 'pre',
      resolveId(id) {
        if (
          id === 'vue' ||
          id === '@dcloudio/uni-mp-vue' ||
          id === '@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js'
        ) {
          return uniMpVueRuntimePath
        }
      },
    },
    uni(),
    uvtw({
      rem2rpx: true,
      disabled: WeappTailwindcssDisabled,
    }),
    AutoImport({
      imports: ['vue', 'uni-app', 'pinia'],
      dts: './src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
  ],
  // 内联 postcss 注册 tailwindcss
  css: {
    postcss: {
      // @ts-ignore
      plugins: postcssPlugins,
    },
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import'],
        quietDeps: true,
      },
    },
  },
  resolve: {
    alias: {
      vue: uniMpVueRuntimePath,
      // Ensure we always consume the Vue 3 runtime that exposes findComponentPropsData
      '@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js': uniMpVueRuntimePath,
      '@dcloudio/uni-mp-vue': uniMpVueDir,
    },
  },
})
