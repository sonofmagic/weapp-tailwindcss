import vue from '@vitejs/plugin-vue'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { createWebDemoWeappTailwindcssPlugins } from '../shared/vite-target'

const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    ...createWebDemoWeappTailwindcssPlugins(projectRoot),
  ],
  build: {
    cssMinify: false,
  },
})
