import uni from '@dcloudio/vite-plugin-uni'
import fs from 'fs-extra'
import path from 'pathe'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { r } from './shared'

function n(id: string) {
  const idx = id.indexOf('node_modules')
  if (idx > -1) {
    return id.slice(idx)
  }
  return path.relative(__dirname, id)
}

export default defineConfig({
  plugins: [
    uni(),
    UnifiedViteWeappTailwindcssPlugin(
      uniAppX({
        base: __dirname,
        rem2rpx: true,
      }),
    ),
    {
      name: 'weapp-tailwindcss:debug:post',
      enforce: 'pre',
      transform(code, id) {
        fs.outputFileSync(
          path.join(__dirname, 'debug', 'pre', n(id)),
          code,
          'utf8',
        )
      },
    },
    {
      name: 'weapp-tailwindcss:debug',
      enforce: 'pre',
      transform(code, id) {
        fs.outputFileSync(
          path.join(__dirname, 'debug', 'normal', n(id)),
          code,
          'utf8',
        )
      },
    },
    {
      name: 'weapp-tailwindcss:debug:post',
      enforce: 'post',
      transform(code, id) {
        fs.outputFileSync(
          path.join(__dirname, 'debug', 'post', n(id)),
          code,
          'utf8',
        )
      },
    },
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          config: r('./tailwind.config.js'),
        }),
      ],
    },
  },
})
