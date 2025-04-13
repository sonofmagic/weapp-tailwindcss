import uni from '@dcloudio/vite-plugin-uni'
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
      }),
    ),
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
