import { defineConfig } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [WeappTailwindcss({ generator: { target: 'web' } })],
})
