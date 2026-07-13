import type { Plugin } from 'vite'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { build } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'
import { WeappTailwindcss } from '@/bundlers/vite'
import { replaceWxml } from '@/wxml'

const require = createRequire(import.meta.url)
const createdDirs: string[] = []
const tailwindcssRoot = path.dirname(require.resolve('tailwindcss/package.json'))
const sourceWxml = '<view class="tracking-[0.2em]">content</view>'

async function createFixtureRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tailwindcss-vite-template-ownership-'))
  createdDirs.push(root)
  await mkdir(path.join(root, 'pages/index'), { recursive: true })
  await mkdir(path.join(root, 'node_modules'), { recursive: true })
  await Promise.all([
    symlink(tailwindcssRoot, path.join(root, 'node_modules/tailwindcss'), 'dir'),
    writeFile(path.join(root, 'app.ts'), 'import "./app.css"\n'),
    writeFile(path.join(root, 'app.css'), '@import "tailwindcss" source(none);\n@source "./pages/index/index.wxml";\n'),
    writeFile(path.join(root, 'pages/index/index.wxml'), sourceWxml),
  ])
  return root
}

function emitWxmlPlugin(): Plugin {
  return {
    name: 'emit-source-wxml',
    buildStart() {
      this.emitFile({
        type: 'asset',
        fileName: 'pages/index/index.wxml',
        source: sourceWxml,
      })
    },
  }
}

function injectTemplateStructurePlugin(): Plugin {
  return {
    name: 'inject-template-structure',
    generateBundle(_options, bundle) {
      const asset = bundle['pages/index/index.wxml']
      if (!asset || asset.type !== 'asset') {
        return
      }
      asset.source = [
        '<block wx:if="{{enabled}}" data-injected="layout">',
        '  <custom-layout bind:ready="handleReady">',
        '    <view class="tracking-[0.2em] mt-[13rpx]">content</view>',
        '  </custom-layout>',
        '</block>',
      ].join('\n')
    },
  }
}

describe('bundlers/vite generateBundle template interoperability', () => {
  afterEach(async () => {
    await Promise.all(createdDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
  })

  it('preserves earlier plugin output and discovers classes added to the bundle asset', async () => {
    const root = await createFixtureRoot()
    const plugins = WeappTailwindcss({
      appType: 'weapp-vite',
      tailwindcssBasedir: root,
    }) ?? []

    await build({
      root,
      logLevel: 'silent',
      plugins: [
        emitWxmlPlugin(),
        injectTemplateStructurePlugin(),
        ...plugins,
      ],
      build: {
        outDir: 'dist',
        minify: false,
        rollupOptions: {
          input: path.join(root, 'app.ts'),
          output: {
            assetFileNames: '[name].[ext]',
            entryFileNames: '[name].js',
          },
        },
      },
    })

    const wxml = await readFile(path.join(root, 'dist/pages/index/index.wxml'), 'utf8')
    const css = await readFile(path.join(root, 'dist/app.css'), 'utf8')

    expect(wxml).toContain('<block wx:if="{{enabled}}" data-injected="layout">')
    expect(wxml).toContain('<custom-layout bind:ready="handleReady">')
    expect(wxml).toContain(replaceWxml('tracking-[0.2em]'))
    expect(wxml).toContain(replaceWxml('mt-[13rpx]'))
    expect(css).toContain(`.${replaceWxml('tracking-[0.2em]')}`)
    expect(css).toContain(`.${replaceWxml('mt-[13rpx]')}`)
  })
})
