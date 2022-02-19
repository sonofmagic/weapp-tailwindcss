import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { ViteWeappTailwindcssPlugin } from '../../'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), ViteWeappTailwindcssPlugin()],
  css: {
    postcss: {
      plugins: [
        require('autoprefixer')(),
        require('tailwindcss')(),
        require('postcss-rem-to-responsive-pixel')({
          rootValue: 32,
          propList: ['*'],
          transformUnit: 'rpx'
        })
      ]
    }
  }
})
