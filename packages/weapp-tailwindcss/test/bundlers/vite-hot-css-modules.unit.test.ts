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

  it('does not send supplemental css updates for relative output file names', async () => {
    const ctx = createHmrContext(path.resolve('/project'))

    sendSupplementalCssHotUpdates(ctx, [
      { url: '/app.wxss' } as any,
      { id: 'main.wxss' } as any,
    ], ['app.wxss', 'main.wxss'])
    await Promise.resolve()

    expect(ctx.server.ws.send).not.toHaveBeenCalled()
  })

  it('sends supplemental css updates for absolute source files and vite urls', async () => {
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
          type: 'css-update',
          timestamp: 123,
          path: '/src/main.css',
          acceptedPath: '/src/main.css',
        },
        {
          type: 'css-update',
          timestamp: 123,
          path: '/src/theme.css?t=123',
          acceptedPath: '/src/theme.css?t=123',
        },
      ],
    })
  })
})
