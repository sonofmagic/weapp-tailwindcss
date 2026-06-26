import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import path from 'node:path'
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig, type Plugin } from 'vite'
import { resolveUniPlatform } from 'weapp-tailwindcss/framework'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const require = createRequire(import.meta.url)
const uniMpVueRuntimePath = require.resolve('@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js')
const uniMpVueDir = dirname(uniMpVueRuntimePath)

function singleCssEntryPlugin(): Plugin {
  return {
    name: 'subpackage-uni-single-css-entry',
    enforce: 'pre',
    resolveId(source, importer) {
      if (process.env.E2E_TW_CSS_ENTRY_MODE !== 'single') {
        return null
      }
      if (source === './main.css' && importer?.replace(/\\/g, '/').endsWith('/src/main.ts')) {
        return path.resolve(process.cwd(), 'src/main.single.css')
      }
      return null
    },
  }
}

export default defineConfig(() => {
  return {
    plugins: [
      singleCssEntryPlugin(),
      uni(),
      WeappTailwindcss({
        tailwindcssBasedir: process.cwd(),
        cssSourceTrace: true,
        rem2rpx: true,
        generator: {
          webCompat: resolveUniPlatform().isWeb ? true : undefined,
        },
      }),
    ],
    resolve: {
      alias: {
        '@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js': uniMpVueRuntimePath,
        '@dcloudio/uni-mp-vue': uniMpVueDir,
      },
    },
  }
})
