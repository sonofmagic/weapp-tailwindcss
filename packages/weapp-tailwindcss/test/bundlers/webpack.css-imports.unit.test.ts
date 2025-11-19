import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { applyTailwindcssCssImportRewrite } from '@/bundlers/webpack/shared/css-imports'

function createCompiler() {
  const beforeResolveHandlers: Array<(data?: any) => void> = []
  const compiler = {
    hooks: {
      normalModuleFactory: {
        tap: vi.fn((_name: string, handler: (factory: any) => void) => {
          handler({
            hooks: {
              beforeResolve: {
                tap: vi.fn((_tapName: string, cb: (data?: any) => void) => {
                  beforeResolveHandlers.push(cb)
                }),
              },
            },
          })
        }),
      },
    },
  }

  return {
    compiler,
    beforeResolveHandlers,
  }
}

describe('bundlers/webpack css-imports rewrite', () => {
  it('rewrites root tailwindcss imports in css issuers', () => {
    const { compiler, beforeResolveHandlers } = createCompiler()
    applyTailwindcssCssImportRewrite(compiler as any, {
      pkgDir: '/virtual/weapp-tailwindcss',
      enabled: true,
    })

    expect(compiler.hooks.normalModuleFactory.tap).toHaveBeenCalledTimes(1)
    expect(beforeResolveHandlers).toHaveLength(1)

    const handler = beforeResolveHandlers[0]!
    const data = {
      request: 'tailwindcss',
      contextInfo: { issuer: '/src/app.css' },
    }
    handler(data)
    expect(data.request).toBe(path.join('/virtual/weapp-tailwindcss', 'index.css'))
  })

  it('rewrites subpath imports and handles resource queries', () => {
    const { compiler, beforeResolveHandlers } = createCompiler()
    applyTailwindcssCssImportRewrite(compiler as any, {
      pkgDir: '/virtual/weapp-tailwindcss',
      enabled: true,
    })

    const handler = beforeResolveHandlers[0]!
    const data = {
      request: 'tailwindcss/components',
      contextInfo: { issuer: '/src/global.scss?inline' },
    }
    handler(data)
    expect(data.request).toBe(path.join('/virtual/weapp-tailwindcss', 'components'))
  })

  it('rewrites tailwindcss$ sentinel and ignores non-css issuers', () => {
    const { compiler, beforeResolveHandlers } = createCompiler()
    applyTailwindcssCssImportRewrite(compiler as any, {
      pkgDir: '/virtual/weapp-tailwindcss',
      enabled: true,
    })

    const handler = beforeResolveHandlers[0]!
    const sentinel = {
      request: 'tailwindcss$',
      contextInfo: { issuer: '/src/styles.less' },
    }
    handler(sentinel)
    expect(sentinel.request).toBe(path.join('/virtual/weapp-tailwindcss', 'index.css'))

    const nonCss = {
      request: 'tailwindcss',
      contextInfo: { issuer: '/src/main.ts' },
    }
    handler(nonCss)
    expect(nonCss.request).toBe('tailwindcss')
  })

  it('ignores unrelated requests', () => {
    const { compiler, beforeResolveHandlers } = createCompiler()
    applyTailwindcssCssImportRewrite(compiler as any, {
      pkgDir: '/virtual/weapp-tailwindcss',
      enabled: true,
    })

    const handler = beforeResolveHandlers[0]!
    const unrelated = {
      request: 'tailwindcss-forms',
      contextInfo: { issuer: '/src/app.css' },
    }
    handler(unrelated)
    expect(unrelated.request).toBe('tailwindcss-forms')
  })

  it('skips hook registration when disabled', () => {
    const { compiler } = createCompiler()
    applyTailwindcssCssImportRewrite(compiler as any, {
      pkgDir: '/virtual/weapp-tailwindcss',
      enabled: false,
    })
    expect(compiler.hooks.normalModuleFactory.tap).not.toHaveBeenCalled()
  })
})
