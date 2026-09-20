import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { withGenerationModuleCache } from '@/v4/module-cache'

// 原生 ESM 的依赖缓存协议需要绕过 Vitest 的模块执行器验证。
const { createTailwindGenerationSession, resolveTailwindV4Source } = createRequire(import.meta.url)('../dist/index.cjs') as typeof import('../src')

describe('生成模块缓存', () => {
  it.each([
    { extension: 'cjs', commonJs: true, extensionless: false },
    { extension: 'mjs', commonJs: false, extensionless: false },
    { extension: 'ts', commonJs: false, extensionless: false },
    { extension: 'js', commonJs: true, extensionless: true },
    { extension: 'js', commonJs: false, extensionless: false },
    { extension: 'ts', commonJs: false, extensionless: true },
  ])('复用配置并刷新间接依赖：$extension / CJS=$commonJs / 省略扩展名=$extensionless', async ({ extension, commonJs, extensionless }) => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'generation-module-cache-'))
    const config = path.join(root, `tailwind.config.${extension}`)
    const helper = path.join(root, `color.${extension}`)
    const key = `module-cache:${root}`
    const globals = globalThis as typeof globalThis & Record<string, unknown>
    const prefix = commonJs ? 'module.exports =' : 'export default'
    try {
      await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({ type: commonJs ? 'commonjs' : 'module' }))
      await fs.writeFile(helper, `${prefix} '#112233'`)
      await fs.writeFile(config, [
        commonJs ? `const color = require('./color.${extension}')` : `import color from './color.${extension}'`,
        `globalThis[${JSON.stringify(key)}] = (globalThis[${JSON.stringify(key)}] || 0) + 1`,
        `${prefix} { theme: { extend: { colors: { brand: color } } } }`,
      ].join('\n'))
      const source = await resolveTailwindV4Source({
        projectRoot: path.resolve(import.meta.dirname, '..'),
        base: root,
        css: `@import "tailwindcss"; @config "${(extensionless ? path.join(root, 'tailwind.config') : config).replaceAll('\\', '/')}";`,
      })
      const generate = async () => {
        const session = createTailwindGenerationSession(source)
        try {
          return (await session.generate({ candidates: ['bg-brand'] })).fragments[0]!.root.toString()
        }
        finally {
          session.dispose()
        }
      }
      expect(await generate()).toContain('#112233')
      expect(await generate()).toContain('#112233')
      expect(globals[key]).toBe(1)

      const stat = await fs.stat(helper)
      await fs.writeFile(helper, `${prefix} '#445566'`)
      await fs.utimes(helper, stat.atime, stat.mtime)
      expect(await generate()).toContain('#445566')
      expect(await generate()).toContain('#445566')
      expect(globals[key]).toBe(2)

      const session = createTailwindGenerationSession(source)
      try {
        await session.generate({ candidates: ['bg-brand'] })
        session.invalidate({ type: 'dependencies', paths: [config] })
        await session.generate({ candidates: ['bg-brand'] })
        expect(globals[key]).toBe(3)
      }
      finally {
        session.dispose()
      }
    }
    finally {
      delete globals[key]
      await fs.rm(root, { recursive: true, force: true })
    }
  })

  it('保留已有模块 hook，且不接管引擎调用之外的请求', async () => {
    const hooks = globalThis as typeof globalThis & { __tw_load?: (url: string) => unknown }
    const previous = hooks.__tw_load
    const value = { default: { marker: true } }
    hooks.__tw_load = url => url === 'virtual:config' ? value : undefined
    const loader = { loadModule: vi.fn() }
    try {
      await withGenerationModuleCache(loader, async () => {
        expect(await hooks.__tw_load?.('virtual:config')).toBe(value)
      })
      const url = pathToFileURL(path.join(os.tmpdir(), 'outside-config.cjs'))
      url.searchParams.set('id', 'outside')
      expect(await hooks.__tw_load?.(url.href)).toBeUndefined()
      expect(loader.loadModule).not.toHaveBeenCalled()
    }
    finally {
      if (previous) hooks.__tw_load = previous
      else delete hooks.__tw_load
    }
  })
})
