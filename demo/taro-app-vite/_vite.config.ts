import { defineConfig } from 'vite'
import autoprefixer from 'autoprefixer'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [
    // @ts-ignore
    UnifiedViteWeappTailwindcssPlugin({
      rem2rpx: true,
    })
  ],
  css: {
    postcss: {
      plugins: [
        // Tailwind CSS 由 weapp-tailwindcss 生成模式接管，这里不要再注册 tailwindcss
        autoprefixer()
      ]
    }
  }
})
