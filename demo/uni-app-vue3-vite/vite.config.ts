import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { ViteWeappTailwindcssPlugin } from '../../'
// ViteWeappTailwindcssPlugin()
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), ViteWeappTailwindcssPlugin()]
})
