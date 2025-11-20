import { createRequire } from 'node:module'
import tailwindcss from '@tailwindcss/postcss'
import twv from '@tailwindcss/vite'
import { isCI } from 'ci-info'
import fs from 'fs-extra'
import path from 'pathe'
import { build } from 'vite'
import { afterAll } from 'vitest'
import { UnifiedViteWeappTailwindcssPlugin } from '@/vite'
import { fixturesRootPath } from './util'

const require = createRequire(import.meta.url)
const tailwindcss4Basedir = path.dirname(require.resolve('tailwindcss4/package.json'))
const previousTailwindcssBasedir = process.env.WEAPP_TAILWINDCSS_BASEDIR
if (previousTailwindcssBasedir === undefined) {
  process.env.WEAPP_TAILWINDCSS_BASEDIR = tailwindcss4Basedir
}

afterAll(() => {
  if (previousTailwindcssBasedir === undefined) {
    delete process.env.WEAPP_TAILWINDCSS_BASEDIR
  }
  else {
    process.env.WEAPP_TAILWINDCSS_BASEDIR = previousTailwindcssBasedir
  }
})

describe.skipIf(isCI)('vite', () => {
  it('v4-vite-plugin', async () => {
    await build({
      root: path.resolve(fixturesRootPath, 'v4-vite-plugin'),
      plugins: [
        twv(),
        UnifiedViteWeappTailwindcssPlugin({
          tailwindcssBasedir: tailwindcss4Basedir,
          rewriteCssImports: true,
        }),
      ],
      resolve: {
        alias: [
          { find: /^tailwindcss$/, replacement: path.join(tailwindcss4Basedir, 'index.css') },
          { find: /^tailwindcss\//, replacement: `${tailwindcss4Basedir}/` },
        ],
      },
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
    expect(await fs.readFile(path.resolve(fixturesRootPath, 'v4-vite-plugin/dist/index.css'), 'utf-8')).toMatchSnapshot('css')
    expect(await fs.readFile(path.resolve(fixturesRootPath, 'v4-vite-plugin/dist/index.js'), 'utf-8')).toMatchSnapshot('js')
  })

  it('v4-vite-postcss', async () => {
    const root = path.resolve(fixturesRootPath, 'v4-vite-postcss')
    await build({
      root,
      plugins: [
        UnifiedViteWeappTailwindcssPlugin({
          tailwindcssBasedir: tailwindcss4Basedir,
          rewriteCssImports: true,
        }),
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
    expect(await fs.readFile(path.resolve(fixturesRootPath, 'v4-vite-postcss/dist/index.css'), 'utf-8')).toMatchSnapshot('css')
    expect(await fs.readFile(path.resolve(fixturesRootPath, 'v4-vite-postcss/dist/index.js'), 'utf-8')).toMatchSnapshot('js')
  })
})
