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
      name: 'weapp-tailwindcss:debug:pre',
      enforce: 'pre',
      transform(code, id) {
        fs.outputFileSync(
          path.join(__dirname, 'debug', 'pre', n(id)),
          code,
          'utf8',
        )
      },
      generateBundle(_options, bundle) {
        console.log('generateBundle\n', Object.keys(bundle))
        fs.outputFileSync(path.join(__dirname, 'debug', 'bundle-pre', '_keys.txt'), Object.keys(bundle).join('\n'), 'utf8')
        for (const file of Object.keys(bundle)) {
          const item = bundle[file]
          if (item.type === 'asset') {
            fs.outputFileSync(
              path.join(__dirname, 'debug', 'bundle-pre', 'asset', file),
              item.source,
              'utf8',
            )
          }
          else if (item.type === 'chunk') {
            fs.outputFileSync(
              path.join(__dirname, 'debug', 'bundle-pre', 'chunk', file),
              item.code,
              'utf8',
            )
          }
        }
      },
    },
    {
      name: 'weapp-tailwindcss:debug',
      transform(code, id) {
        fs.outputFileSync(
          path.join(__dirname, 'debug', 'normal', n(id)),
          code,
          'utf8',
        )
      },
      generateBundle(_options, bundle) {
        console.log('generateBundle\n', Object.keys(bundle))
        fs.outputFileSync(path.join(__dirname, 'debug', 'bundle-normal', '_keys.txt'), Object.keys(bundle).join('\n'), 'utf8')
        for (const file of Object.keys(bundle)) {
          const item = bundle[file]
          if (item.type === 'asset') {
            fs.outputFileSync(
              path.join(__dirname, 'debug', 'bundle-normal', 'asset', file),
              item.source,
              'utf8',
            )
          }
          else if (item.type === 'chunk') {
            fs.outputFileSync(
              path.join(__dirname, 'debug', 'bundle-normal', 'chunk', file),
              item.code,
              'utf8',
            )
          }
        }
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
      generateBundle(_options, bundle) {
        console.log('generateBundle\n', Object.keys(bundle))
        fs.outputFileSync(path.join(__dirname, 'debug', 'bundle-post', '_keys.txt'), Object.keys(bundle).join('\n'), 'utf8')
        for (const file of Object.keys(bundle)) {
          const item = bundle[file]
          if (item.type === 'asset') {
            fs.outputFileSync(
              path.join(__dirname, 'debug', 'bundle-post', 'asset', file),
              item.source,
              'utf8',
            )
          }
          else if (item.type === 'chunk') {
            fs.outputFileSync(
              path.join(__dirname, 'debug', 'bundle-post', 'chunk', file),
              item.code,
              'utf8',
            )
          }
        }
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
