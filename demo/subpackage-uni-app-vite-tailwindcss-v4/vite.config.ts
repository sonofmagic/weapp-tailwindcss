import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig, type Plugin } from 'vite'
import { resolveUniPlatform } from 'weapp-tailwindcss/framework'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const require = createRequire(import.meta.url)
const projectRoot = dirname(fileURLToPath(import.meta.url))
const uniMpVueRuntimePath = require.resolve('@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js')
const uniMpVueDir = dirname(uniMpVueRuntimePath)
const cssMode = process.env.E2E_TW_CSS_ENTRY_MODE === 'single' ? 'single' : 'isolated'
const cssEntries = cssMode === 'single'
  ? [path.resolve(projectRoot, 'src/main.single.css')]
  : [
      path.resolve(projectRoot, 'src/main.css'),
      path.resolve(projectRoot, 'src/sub-normal/pages/index.css'),
      path.resolve(projectRoot, 'src/sub-independent/pages/index.css'),
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
        return path.resolve(projectRoot, 'src/main.single.css')
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
      WeappTailwindcss({
        tailwindcssBasedir: projectRoot,
        cssEntries,
        cssSourceTrace: true,
        rem2rpx: true,
        generator: {
          webCompat: uniPlatform.isWeb ? true : undefined,
        },
        styleInjector: false,
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
