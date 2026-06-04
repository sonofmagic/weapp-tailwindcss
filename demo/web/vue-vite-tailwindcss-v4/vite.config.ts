import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { createWebDemoWeappTailwindcssPlugins } from '../shared/vite-target'

export default defineConfig({
  plugins: [
    vue(),
    ...createWebDemoWeappTailwindcssPlugins(),
  ],
  build: {
    cssMinify: false,
  },
})
