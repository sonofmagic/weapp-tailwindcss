import uni from '@dcloudio/vite-plugin-uni'
import tailwindcss from '@tailwindcss/postcss'
import fs from 'fs-extra'
import path from 'pathe'
import { defineConfig } from 'vite'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

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
          base: __dirname,
        }),
      ],
    },
  },
})
