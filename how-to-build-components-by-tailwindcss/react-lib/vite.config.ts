import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({
    include: ['src/components/**/*'],
    // beforeWriteFile: (filePath, content) => ({
    //   filePath: filePath.replace('/lib', ''),
    //   content,
    // }),
  })],
  build: {
    lib: {
      entry: resolve('src', 'components', 'index.tsx'),
      name: 'ice-tw-buttons',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react'],
    },
  },
})
