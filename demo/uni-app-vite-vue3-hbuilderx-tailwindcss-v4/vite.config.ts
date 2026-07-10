import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'
import parity from '../official-postcss-parity-plugin.cjs'
import { hbuilderx } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const uni = (uniModule as typeof uniModule & { default?: typeof uniModule }).default ?? uniModule
const projectRoot = dirname(fileURLToPath(import.meta.url))
const officialPostcssParity = process.env.WEAPP_TW_OFFICIAL_POSTCSS_PARITY === '1'
const weappTailwindcssPlugins = WeappTailwindcss(
  hbuilderx({
    base: projectRoot,
    cssEntries: [
      resolve(projectRoot, 'main.css'),
      resolve(projectRoot, 'sub-normal/pages/index.css'),
      resolve(projectRoot, 'sub-independent/pages/index.css'),
    ],
    cssSourceTrace: true,
    rem2rpx: true,
    customAttributes: {
      '*': [/^t-class(?:-.+)?$/],
    },
    generator: officialPostcssParity ? false : undefined,
  }),
) ?? []

export default defineConfig({
  plugins: [
    uni(),
    ...weappTailwindcssPlugins,
  ],
  css: {
    postcss: {
      plugins: parity.createOfficialPostcssParityPlugins(),
    },
  },
})
