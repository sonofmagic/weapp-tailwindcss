import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const require = createRequire(import.meta.url)
const uniPlugin = require('@dcloudio/vite-plugin-uni')

const uni = uniPlugin.default ?? uniPlugin

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss({
      cssOptions: {
        rem2rpx: true,
      },
      cssEntries: [path.resolve(process.cwd(), 'src/main.css')],
    }),
  ],
})
