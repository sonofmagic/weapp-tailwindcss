import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { expect, it } from 'vitest'
import { prepareInjectedCss } from '../authored.mjs'
import { connectMpxSidecar, mpxSidecarOwner } from '../authored-mpx.mjs'

it('Webpack 样式注入按原文消费，不按文件扩展名额外加载预处理器', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cost-authored-'))
  const css = '.entry { color: #0891b2; }'
  try {
    for (const extension of ['scss', 'less']) {
      const sourceAbsolutePath = path.join(directory, `entry.${extension}`)
      await writeFile(sourceAbsolutePath, css)
      const require = () => { throw new Error('原文注入不得加载预处理器') }
      expect(await prepareInjectedCss({ sourceAbsolutePath, preprocess: true }, 'weapp-style-injector/webpack/mpx', require)).toBe(css)
      expect(await prepareInjectedCss({ sourceAbsolutePath, preprocess: false }, 'weapp-style-injector/vite/uni-app', require)).toBe(css)
    }
  }
  finally { await rm(directory, { recursive: true, force: true }) }
})

it('启用 Vite 预处理时执行真实 Sass，而不是删除预处理语法', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cost-authored-'))
  try {
    const sourceAbsolutePath = path.join(directory, 'entry.scss')
    await writeFile(sourceAbsolutePath, '$space: 2px; .entry { margin: $space; }')
    expect(await prepareInjectedCss({ sourceAbsolutePath, preprocess: true }, 'weapp-style-injector/vite/uni-app', createRequire(import.meta.url))).toContain('margin: 2px')
  }
  finally { await rm(directory, { recursive: true, force: true }) }
})

it('Mpx sidecar 必须由已发现的页面源码实际导入，已有导入不重复添加', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cost-mpx-sidecar-'))
  try {
    const page = path.join(directory, 'entry.mpx')
    const css = path.join(directory, 'entry.css')
    await writeFile(page, '<template><view/></template>')
    const result = new Map()
    await connectMpxSidecar(result, directory, css, ['entry.mpx'])
    expect(result.get('entry.mpx')).toContain('<style src="./entry.css"></style>')
    const first = result.get('entry.mpx')
    await connectMpxSidecar(result, directory, css, ['entry.mpx'])
    expect(result.get('entry.mpx')).toBe(first)
    await expect(connectMpxSidecar(new Map(), directory, css, ['unrelated.mpx'])).rejects.toThrow('源码归属')
  }
  finally { await rm(directory, { recursive: true, force: true }) }
})

it('Mpx 源码归属兼容 POSIX、Windows 盘符与相对路径，不跨根匹配', () => {
  expect(mpxSidecarOwner('/app', 'feature/entry.css', ['feature/entry.mpx'], path.posix)).toBe('/app/feature/entry.mpx')
  expect(mpxSidecarOwner('C:\\app', 'C:\\app\\feature\\entry.css', ['feature\\entry.mpx'], path.win32)).toBe('C:\\app\\feature\\entry.mpx')
  expect(mpxSidecarOwner('C:\\app', 'feature\\entry.css', ['C:\\app\\feature\\entry.mpx'], path.win32)).toBe('C:\\app\\feature\\entry.mpx')
  expect(() => mpxSidecarOwner('C:\\app', 'C:\\app\\entry.css', ['D:\\app\\entry.mpx'], path.win32)).toThrow('源码归属')
})
