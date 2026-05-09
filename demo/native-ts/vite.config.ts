import { defineConfig } from 'weapp-vite/config'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export default defineConfig({
  weapp: {
    // weapp-vite options
    srcRoot: './miniprogram'
  },
  plugins: [WeappTailwindcss({
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
