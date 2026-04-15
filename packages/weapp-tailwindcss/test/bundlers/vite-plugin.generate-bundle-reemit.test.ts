import type { Plugin } from 'vite'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { build } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'
import { UnifiedViteWeappTailwindcssPlugin } from '@/bundlers/vite'

const createdDirs: string[] = []

const rawCss = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
}

::backdrop {
  --tw-border-spacing-x: 0;
}

.mt-\\[10rpx\\] {
  margin-top: 10rpx;
}
`

async function createFixtureRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tailwindcss-vite-reemit-'))
  createdDirs.push(root)

  await Promise.all([
    writeFile(path.join(root, 'app.ts'), 'import "./app.css"\nconsole.log("vite css asset")\n'),
    writeFile(path.join(root, 'app.css'), rawCss),
  ])

  return root
}

function renameCssToWxssPlugin(): Plugin {
  return {
    name: 'rename-css-to-wxss-plugin',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const cssAsset = bundle['app.css']
      if (!cssAsset || cssAsset.type !== 'asset') {
        return
      }

      delete bundle['app.css']
      this.emitFile({
        type: 'asset',
        fileName: 'app.wxss',
        // 模拟同轮 generateBundle 内重新发射一个“最终才出现”的小程序样式资产。
        // 关键点不在 rename 细节，而在于最终落盘资产没有再次进入 weapp-tailwindcss 的样式处理链路。
        source: rawCss,
      })
    },
  }
}

function normalizeCss(css: string) {
  return css.replaceAll(/\s+/g, ' ').trim()
}

async function runBuild(renameInGenerateBundle: boolean) {
  const root = await createFixtureRoot()
  const distDir = path.join(root, 'dist')
  const unifiedPlugins = UnifiedViteWeappTailwindcssPlugin({
    appType: 'weapp-vite',
  })
  const plugins: Plugin[] = renameInGenerateBundle
    ? [...unifiedPlugins, renameCssToWxssPlugin()]
    : [...unifiedPlugins]

  await build({
    root,
    logLevel: 'silent',
    plugins,
    build: {
      outDir: 'dist',
      minify: false,
      rollupOptions: {
        input: path.join(root, 'app.ts'),
        output: {
          assetFileNames: '[name].[ext]',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
        },
      },
    },
  })

  const cssFile = renameInGenerateBundle
    ? path.join(distDir, 'app.wxss')
    : path.join(distDir, 'app.css')

  return {
    css: normalizeCss(await readFile(cssFile, 'utf8')),
    distDir,
  }
}

describe('bundlers/vite generateBundle css rename/re-emit regression', () => {
  afterEach(async () => {
    await Promise.all(
      createdDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })),
    )
  })

  it('keeps the normal app.css path transformed', async () => {
    const { css } = await runBuild(false)

    expect(css).not.toContain('*, ::before, ::after')
    expect(css).not.toContain('::backdrop')
    expect(css).not.toContain('.mt-\\[10rpx\\]')
    expect(css).toContain('.mt-_b10rpx_B')
    expect(css).toContain('view,text,::before,::after')
  })

  it('transforms miniapp style assets that are renamed and re-emitted during generateBundle', async () => {
    // 根因回归说明：
    // 当前 Vite 适配层在 generateBundle 入口构建一次 bundle 快照，
    // 隐含假设是“本插件执行时可以稳定看到最终 css asset”。
    // 但如果前序插件在同一轮 generateBundle 里删除旧 css 再重新 emit 新的 wxss，
    // 这个假设并不成立，最终 app.wxss 可能逃逸出 transformWxss/styleHandler 链路。
    const { css } = await runBuild(true)

    expect(css).not.toContain('*, ::before, ::after')
    expect(css).not.toContain('::backdrop')
    expect(css).not.toContain('.mt-\\[10rpx\\]')
    expect(css).toContain('.mt-_b10rpx_B')
    expect(css).toContain('view,text,::before,::after')
  })
})
