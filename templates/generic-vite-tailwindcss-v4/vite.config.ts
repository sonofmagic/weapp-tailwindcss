import { defineConfig } from 'vite'
import { WeappTailwindcssWeb } from 'weapp-tailwindcss/vite/web'

export default defineConfig({
  plugins: [WeappTailwindcssWeb()],
})
