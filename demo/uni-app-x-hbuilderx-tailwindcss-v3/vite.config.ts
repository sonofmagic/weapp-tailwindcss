import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { debugX } from '@weapp-tailwindcss/debug-uni-app-x'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const weappTailwindcssPlugins = WeappTailwindcss(
  uniAppX({
    base: __dirname,
    cssSourceTrace: true,
    rem2rpx: true,
  }),
) ?? []
const debugUniAppXPlugins = debugX({
  cwd: __dirname,
})

export default defineConfig({
  plugins: [
    uni(),
    ...weappTailwindcssPlugins,
    ...debugUniAppXPlugins,
  ],
})
