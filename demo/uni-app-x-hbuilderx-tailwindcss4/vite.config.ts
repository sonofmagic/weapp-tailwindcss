// import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { debugX } from '@weapp-tailwindcss/debug-uni-app-x'

export default defineConfig({
  plugins: [
    // uni(),
    WeappTailwindcss(
      uniAppX({
        base: __dirname,
        rem2rpx: true,
      }),
    ),
    debugX({
      enabled: true,
    }),
  ],
})
