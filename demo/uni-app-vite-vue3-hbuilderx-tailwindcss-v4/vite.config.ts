import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'
import { hbuilderx } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const uni = (uniModule as typeof uniModule & { default?: typeof uniModule }).default ?? uniModule
const projectRoot = dirname(fileURLToPath(import.meta.url))
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
  }),
) ?? []

export default defineConfig({
  plugins: [
    uni(),
    ...weappTailwindcssPlugins,
  ],
})
