import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { r } from './shared'
import { debugX } from '@weapp-tailwindcss/debug-uni-app-x'

export default defineConfig({
  plugins: [
    UnifiedViteWeappTailwindcssPlugin(
      uniAppX({
        base: __dirname,
        rem2rpx: true,
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
