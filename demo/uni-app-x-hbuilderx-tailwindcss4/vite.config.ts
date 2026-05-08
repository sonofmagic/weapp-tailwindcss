import path from 'node:path'
// import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { debugX } from '@weapp-tailwindcss/debug-uni-app-x'

export default defineConfig({
  plugins: [
    // uni(),
    UnifiedViteWeappTailwindcssPlugin(
      uniAppX({
        base: __dirname,
        rem2rpx: true,
        generator: {
          mode: 'force',
          target: 'weapp',
        },
        cssEntries: [path.resolve(__dirname, 'main.css')],
      }),
    ),
    debugX({
      enabled: true,
    }),
  ],
})
