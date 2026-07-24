import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import uni from '@dcloudio/vite-plugin-uni'
import parity from '../official-postcss-parity-plugin.cjs'
import { defineConfig, normalizePath, type Plugin } from 'vite'
import { resolveUniPlatform } from 'weapp-tailwindcss/framework'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const require = createRequire(import.meta.url)
const projectRoot = dirname(fileURLToPath(import.meta.url))
const uniMpVueRuntimePath = require.resolve('@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js')
const uniMpVueDir = dirname(uniMpVueRuntimePath)
const cssMode = process.env.E2E_TW_CSS_ENTRY_MODE === 'single' ? 'single' : 'isolated'
const officialPostcssParity = process.env.WEAPP_TW_OFFICIAL_POSTCSS_PARITY === '1'
const cssEntries = cssMode === 'single'
  ? [path.resolve(projectRoot, 'src/main.single.css')]
  : [
      path.resolve(projectRoot, 'src/main.css'),
      path.resolve(projectRoot, 'src/sub-normal/index.css'),
      path.resolve(projectRoot, 'src/sub-independent/index.css'),
    ]
const singleSubpackageEntrySources = new Map([
  [
    normalizePath(path.resolve(projectRoot, 'src/sub-normal/pages/index.css')),
    path.resolve(projectRoot, 'src/sub-normal/pages/index.single.css'),
  ],
  [
    normalizePath(path.resolve(projectRoot, 'src/sub-independent/pages/index.css')),
    path.resolve(projectRoot, 'src/sub-independent/pages/index.single.css'),
  ],
])

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
    async load(id) {
      if (process.env.E2E_TW_CSS_ENTRY_MODE !== 'single') {
        return null
      }
      const cleanId = id.split('?', 1)[0]
      const singleEntrySource = cleanId ? singleSubpackageEntrySources.get(normalizePath(cleanId)) : undefined
      if (!singleEntrySource) {
        return null
      }
      this.addWatchFile(singleEntrySource)
      return readFile(singleEntrySource, 'utf8')
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
        generator: officialPostcssParity
          ? false
          : {
              webCompat: uniPlatform.isWeb ? true : undefined,
            },
        styleInjector: cssMode === 'isolated'
          ? {
              rules: {
                'index.css': [
                  'pages/**/*.css',
                  'pages/**/*.wxss',
                  'pages/**/*.acss',
                  'pages/**/*.ttss',
                  'pages/**/*.qss',
                  'pages/**/*.jxss',
                ],
              },
            }
          : false,
        customAttributes: {
          '*': [/^t-class(?:-.+)?$/],
        },
      }),
    ],
    css: {
      postcss: {
        plugins: parity.createOfficialPostcssParityPlugins(),
      },
    },
    resolve: {
      alias: {
        '@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js': uniMpVueRuntimePath,
        '@dcloudio/uni-mp-vue': uniMpVueDir,
      },
    },
  }
})
