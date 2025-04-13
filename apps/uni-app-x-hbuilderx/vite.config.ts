import uni from '@dcloudio/vite-plugin-uni'
import tailwindcss from '@tailwindcss/postcss'
import { defineConfig } from 'vite'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [
    uni(),
    UnifiedViteWeappTailwindcssPlugin(
      {
        rem2rpx: true,
        tailwindcssPatcherOptions: {
          patch: {
            tailwindcss: {
              v4: {
                base: __dirname,
              },
            },
          },
        },
      },
    ),
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
