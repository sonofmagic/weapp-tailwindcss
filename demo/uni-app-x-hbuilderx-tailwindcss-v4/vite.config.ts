import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'
import { debugX } from '@weapp-tailwindcss/debug-uni-app-x'
import parity from '../official-postcss-parity-plugin.cjs'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const uni = (uniModule as typeof uniModule & { default?: typeof uniModule }).default ?? uniModule
const projectRoot = dirname(fileURLToPath(import.meta.url))
const officialPostcssParity = process.env.WEAPP_TW_OFFICIAL_POSTCSS_PARITY === '1'
const weappTailwindcssPlugins = WeappTailwindcss(
  uniAppX({
    base: projectRoot,
    cssEntries: [
      resolve(projectRoot, 'main.css'),
    ],
    cssSourceTrace: true,
    rem2rpx: true,
    customAttributes: {
      '*': [/^t-class(?:-.+)?$/],
    },
    generator: officialPostcssParity ? false : undefined,
  }),
) ?? []
const debugUniAppXPlugins = debugX({
  cwd: projectRoot,
})

export default defineConfig({
  plugins: [
    uni(),
    ...weappTailwindcssPlugins,
    ...debugUniAppXPlugins,
  ],
  css: {
    postcss: {
      plugins: parity.createOfficialPostcssParityPlugins(),
    },
  },
})
