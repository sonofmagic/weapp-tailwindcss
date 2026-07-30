import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { resolveHotTailwindCssModules, sendSupplementalCssHotUpdates } from '@/bundlers/vite/hot-css-modules'

function createHmrContext(root: string) {
  const send = vi.fn()
  return {
    timestamp: 123,
    modules: [],
    server: {
      config: {
        root,
        build: {
          outDir: 'dist/dev/mp-weixin',
        },
      },
      moduleGraph: {
        getModuleById: vi.fn(),
        getModulesByFile: vi.fn(() => []),
        invalidateModule: vi.fn(),
      },
      ws: {
        send,
      },
    },
  } as any
}

describe('bundlers/vite hot css modules', () => {
  it('does not resolve mini-program output style modules as hot source css modules', () => {
    const root = path.resolve('/project')
    const outputModule = {
      url: '/app.wxss',
      id: undefined,
    } as any
    const sourceModule = {
      url: '/src/main.css',
      id: path.join(root, 'src/main.css'),
    } as any
    const distModule = {
      id: path.join(root, 'dist/dev/mp-weixin/app.wxss'),
    } as any
    const ctx = createHmrContext(root)
    ctx.server.moduleGraph.getModuleById = vi.fn((id: string) => {
      if (id === '/app.wxss') {
        return outputModule
      }
      if (id === sourceModule.id) {
        return sourceModule
      }
      if (id === distModule.id) {
        return distModule
      }
      return undefined
    })

    const modules = resolveHotTailwindCssModules(ctx, new Set([
      '/app.wxss',
      sourceModule.id,
      distModule.id,
    ]))

    expect(modules).toEqual([sourceModule])
    expect(ctx.server.moduleGraph.invalidateModule).toHaveBeenCalledWith(sourceModule)
    expect(ctx.server.moduleGraph.invalidateModule).not.toHaveBeenCalledWith(outputModule)
    expect(ctx.server.moduleGraph.invalidateModule).not.toHaveBeenCalledWith(distModule)
  })

  it('does not pass invalid remembered css module ids to the Vite module graph', () => {
    const root = path.resolve('/project')
    const sourceModule = {
      file: path.join(root, 'src/main.css'),
      id: path.join(root, 'src/main.css?direct'),
      url: '/src/main.css?direct',
    } as any
    const ctx = createHmrContext(root)
    const assertStringId = (id: unknown) => {
      if (typeof id !== 'string') {
        throw new TypeError('module id must be a string')
      }
      return id
    }
    ctx.server.moduleGraph.getModuleById = vi.fn((id: unknown) => {
      return assertStringId(id) === sourceModule.id ? sourceModule : undefined
    })
    ctx.server.moduleGraph.getModulesByFile = vi.fn((id: unknown) => {
      return assertStringId(id) === sourceModule.file ? new Set([sourceModule]) : undefined
    })
    const rememberedIds = new Set([
      sourceModule.id,
      sourceModule.file,
      null,
      undefined,
      '',
    ]) as unknown as Set<string>

    expect(() => resolveHotTailwindCssModules(ctx, rememberedIds)).not.toThrow()
    expect(ctx.server.moduleGraph.invalidateModule).toHaveBeenCalledWith(sourceModule)
    expect(ctx.server.moduleGraph.getModuleById.mock.calls.flat()).toEqual(expect.arrayContaining([
      sourceModule.id,
      sourceModule.file,
    ]))
    expect(ctx.server.moduleGraph.getModuleById.mock.calls.flat().every((id: unknown) => typeof id === 'string' && id.length > 0)).toBe(true)
    expect(ctx.server.moduleGraph.getModulesByFile.mock.calls.flat().every((id: unknown) => typeof id === 'string' && id.length > 0)).toBe(true)
  })

  it('does not send supplemental css updates for relative output file names', async () => {
    const ctx = createHmrContext(path.resolve('/project'))

    sendSupplementalCssHotUpdates(ctx, [
      { url: '/app.wxss' } as any,
      { id: 'main.wxss' } as any,
    ], ['app.wxss', 'main.wxss'])
    await Promise.resolve()

    expect(ctx.server.ws.send).not.toHaveBeenCalled()
  })

  it('sends supplemental js updates for absolute source files and vite urls', async () => {
    const root = path.resolve('/project')
    const ctx = createHmrContext(root)

    sendSupplementalCssHotUpdates(ctx, [], [
      path.join(root, 'src/main.css'),
      '/src/theme.css?t=123',
    ])
    await Promise.resolve()

    expect(ctx.server.ws.send).toHaveBeenCalledWith({
      type: 'update',
      updates: [
        {
          type: 'js-update',
          timestamp: 123,
          path: '/src/main.css',
          acceptedPath: '/src/main.css',
          explicitImportRequired: false,
          isWithinCircularImport: false,
        },
        {
          type: 'js-update',
          timestamp: 123,
          path: '/src/theme.css?t=123',
          acceptedPath: '/src/theme.css?t=123',
          explicitImportRequired: false,
          isWithinCircularImport: false,
        },
      ],
    })
  })
})
