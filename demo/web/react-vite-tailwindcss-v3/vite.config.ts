import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createWebDemoWeappTailwindcssPlugins } from '../shared/vite-target'

export default defineConfig({
  plugins: [
    react(),
    ...createWebDemoWeappTailwindcssPlugins(),
  ],
})
