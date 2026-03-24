import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import uniPlugin from '@dcloudio/vite-plugin-uni'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { r } from './shared'
import { debugX } from '@weapp-tailwindcss/debug-uni-app-x'

const uni = typeof uniPlugin === 'function' ? uniPlugin : uniPlugin.default

export default defineConfig({
  plugins: [
    uni(),
    UnifiedViteWeappTailwindcssPlugin(
      uniAppX({
        base: __dirname,
        rem2rpx: true,
      }),
    ),
    debugX({
      cwd: __dirname,
      enabled: true,
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
