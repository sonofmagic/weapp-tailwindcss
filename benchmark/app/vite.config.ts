import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      /* options */
    }),
    vue(),
    tailwindcss(),
    UnifiedViteWeappTailwindcssPlugin({
      rem2rpx: true,
    }),
    Inspect({
      build: true,
      outputDir: '.vite-inspect',
    }),
  ],
  build: {
    cssMinify: false,
  },
})
