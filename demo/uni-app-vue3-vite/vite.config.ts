import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// import { ViteWeappTailwindcssPlugin } from '../../'
import { ViteWeappTailwindcssPlugin as wt } from 'weapp-tailwindcss-webpack-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), wt()]
})
