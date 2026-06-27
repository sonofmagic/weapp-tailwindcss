import path from 'node:path'
import process from 'node:process'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  plugins: [
    WeappTailwindcss({
      cssOptions: {
        rem2rpx: true,
      },
      cssEntries: [path.resolve(process.cwd(), 'app.css')],
    }),
  ],
})
