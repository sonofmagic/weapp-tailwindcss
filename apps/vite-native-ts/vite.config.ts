import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  plugins: [
    UnifiedViteWeappTailwindcssPlugin({
      rem2rpx: true,
    }),
  ],
  weapp: {
    // weapp-vite options
    srcRoot: './miniprogram',
  },
})
