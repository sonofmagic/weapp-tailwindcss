import uni from '@dcloudio/vite-plugin-uni'
import { debugX } from '@weapp-tailwindcss/debug-uni-app-x'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { r } from './shared'

export default defineConfig({
  plugins: [
    uni(),
    UnifiedViteWeappTailwindcssPlugin(
      uniAppX({
        base: __dirname,
        rem2rpx: true,
        resolve: {
          paths: [import.meta.url],
        },
        // rawOptions: {
        //   tailwindcss: {
        //     version: 3,
        //   },
        // },
      }),
    ),
    debugX({
      cwd: __dirname,
    }),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          config: r('./tailwind.config.js'),
        }),
      ],
    },
  },
})
