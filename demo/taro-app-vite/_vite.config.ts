import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [
    // @ts-ignore
    UnifiedViteWeappTailwindcssPlugin({
      rem2rpx: true
    })
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer()
      ]
    }
  }
})
