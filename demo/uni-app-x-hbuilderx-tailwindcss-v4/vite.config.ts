import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'
import { debugX } from '@weapp-tailwindcss/debug-uni-app-x'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const uni = (uniModule as typeof uniModule & { default?: typeof uniModule }).default ?? uniModule
const projectRoot = dirname(fileURLToPath(import.meta.url))
const weappTailwindcssPlugins = WeappTailwindcss(
  uniAppX({
    base: projectRoot,
    cssEntries: [
      resolve(projectRoot, 'main.css'),
    ],
    cssSourceTrace: true,
    rem2rpx: true,
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
})
