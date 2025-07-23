import path from 'node:path'
import uni from '@dcloudio/vite-plugin-uni'
import tailwindcss from '@tailwindcss/postcss'
import { debugX } from '@weapp-talwindcss/debug-uni-app-x'
import { defineConfig } from 'vite'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [
    uni(),
    UnifiedViteWeappTailwindcssPlugin(
      uniAppX({
        base: __dirname,
        rem2rpx: true,
        cssEntries: [path.resolve(__dirname, 'main.css')],
        resolve: {
          paths: [import.meta.url],
        },
        rawOptions: {
          tailwindcss: {
            version: 4,
          },
        },
      }),
    ),
    // debugX({
    //   cwd: __dirname,
    // }),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          base: __dirname,
        }),
      ],
    },
  },
})
