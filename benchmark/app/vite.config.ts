import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    tailwindcss(),
    ...(command === 'serve'
      ? [Inspect({
          outputDir: '.vite-inspect',
        })]
      : []),
  ],
  build: {
    cssMinify: false,
  },
}))
