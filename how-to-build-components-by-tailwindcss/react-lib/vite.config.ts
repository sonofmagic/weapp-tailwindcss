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
      entry: {
        index: resolve('src', 'components', 'index.tsx'),
        taro: resolve('src', 'components', 'taro.tsx')
      },
      name: 'ice-tw-buttons',
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@tarojs/taro', '@tarojs/components'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
