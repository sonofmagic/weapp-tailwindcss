import { defineConfig } from 'weapp-vite/config'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
export default defineConfig({
  weapp: {
    // weapp-vite options
    srcRoot: './miniprogram'
  },
  plugins: [UnifiedViteWeappTailwindcssPlugin({
    rem2rpx: true,
  })],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      }
    }
  }
})
