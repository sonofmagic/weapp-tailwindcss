import path from 'node:path'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { hbuilderx } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss(
      hbuilderx({
        base: __dirname,
        cssEntries: [
          path.resolve(__dirname, 'main.css'),
        ],
        rem2rpx: true,
      }),
    ),
  ],
})
