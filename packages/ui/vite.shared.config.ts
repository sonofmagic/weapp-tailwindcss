import path from 'pathe'

// https://vite.dev/guide/build.html#library-mode
import { defineConfig } from 'vite'

export const sharedConfig = defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '~': path.resolve(import.meta.dirname, 'lib'),
    },
  },
})
