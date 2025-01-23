import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
    /* options */
    }),
    vue(),
    tailwindcss(),
  ],
  build: {
    cssMinify: false,
  },
})
