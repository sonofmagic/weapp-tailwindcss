import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import path from 'node:path'
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig, type Plugin } from 'vite'
import { StyleInjector } from 'weapp-style-injector/vite/uni-app'
import { resolveUniPlatform } from 'weapp-tailwindcss/framework'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const require = createRequire(import.meta.url)
const uniMpVueRuntimePath = require.resolve('@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js')
const uniMpVueDir = dirname(uniMpVueRuntimePath)
const cssMode = process.env.E2E_TW_CSS_ENTRY_MODE === 'single' ? 'single' : 'isolated'
const cssEntries = cssMode === 'single'
  ? [path.resolve(process.cwd(), 'src/main.single.css')]
  : [
      path.resolve(process.cwd(), 'src/main.css'),
      path.resolve(process.cwd(), 'src/sub-normal/index.css'),
      path.resolve(process.cwd(), 'src/sub-independent/index.css'),
    ]

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
  const uniPlatform = resolveUniPlatform()

  return {
    plugins: [
      singleCssEntryPlugin(),
      uni(),
      ...(cssMode === 'isolated' && !uniPlatform.isWeb
        ? [
            StyleInjector({
              styleEntries: [
                {
                  sourceFileName: 'index.css',
                },
              ],
            }),
          ]
        : []),
      WeappTailwindcss({
        tailwindcssBasedir: process.cwd(),
        cssEntries,
        cssSourceTrace: true,
        rem2rpx: true,
        generator: {
          webCompat: uniPlatform.isWeb ? true : undefined,
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
