import { UnifiedViteWeappTailwindcssPlugin } from '@/vite'
import tailwindcss from '@tailwindcss/postcss'
import twv from '@tailwindcss/vite'
import path from 'pathe'
import { build } from 'vite'
import { fixturesRootPath } from './util'

describe('vite', () => {
  it('v4-vite-plugin', async () => {
    await build({
      root: path.resolve(fixturesRootPath, 'v4-vite-plugin'),
      plugins: [
        twv(),
        UnifiedViteWeappTailwindcssPlugin(),
      ],
      build: {
        minify: false,
        rollupOptions: {
          output: {
            assetFileNames: '[name].[ext]',
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
          },
        },
      },
    })
  })

  it('v4-vite-postcss', async () => {
    const root = path.resolve(fixturesRootPath, 'v4-vite-postcss')
    await build({
      root,
      plugins: [
        UnifiedViteWeappTailwindcssPlugin(),
      ],
      build: {
        minify: false,
        rollupOptions: {
          output: {
            assetFileNames: '[name].[ext]',
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
          },
        },
      },
      css: {
        postcss: {
          plugins: [
            tailwindcss(
              {
                base: root,
              },
            ),
          ],
        },
      },
    })
  })
})
