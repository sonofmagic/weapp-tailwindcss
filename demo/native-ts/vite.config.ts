import { defineConfig } from 'weapp-vite/config'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { resolveDemoGeneratorMode } from '../shared/weapp-tailwind-generator-mode'

const generator = resolveDemoGeneratorMode()

export default defineConfig({
  weapp: {
    // weapp-vite options
    srcRoot: './miniprogram'
  },
  plugins: [UnifiedViteWeappTailwindcssPlugin({
    rem2rpx: true,
    ...(generator !== undefined ? { generator } : {}),
  })],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      }
    }
  }
})
