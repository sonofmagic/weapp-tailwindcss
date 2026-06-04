import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const uni = (uniModule as typeof uniModule & { default?: typeof uniModule }).default ?? uniModule
const projectRoot = dirname(fileURLToPath(import.meta.url))
const weappTailwindcssPlugins = WeappTailwindcss(
  uniAppX({
    base: projectRoot,
    rem2rpx: true,
  }),
) ?? []

export default defineConfig({
  plugins: [
    uni(),
    ...weappTailwindcssPlugins,
  ],
})
