import { afterEach, describe, expect, it, vi } from 'vitest'

function normalizeGeneratorOptions(options: any) {
  if (options === false) {
    return { mode: 'off', target: 'weapp' }
  }
  if (options === true || options == null) {
    return { mode: 'auto', target: 'weapp' }
  }
  return {
    mode: options.mode ?? 'auto',
    target: options.target ?? 'weapp',
    styleOptions: options.styleOptions,
  }
}

describe('bundlers/shared generator css', () => {
  afterEach(() => {
    vi.doUnmock('@/generator')
    vi.resetModules()
  })

  it('generates mini-program css and skips legacy style handler for matching Tailwind v4 output', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}'
    const weappCss = '.w-_b100px_B{width:100px}'
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: runtimeSet,
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
    }))

    const { generateCssByGenerator } = await import('@/bundlers/shared/generator-css')
    const styleHandler = vi.fn(async (code: string) => ({ css: `legacy:${code}` }))
    const result = await generateCssByGenerator({
      opts: {
        generator: {
          mode: 'force',
          target: 'weapp',
        },
        styleHandler,
      } as any,
      runtimeState: {
        twPatcher: {
          majorVersion: 4,
        } as any,
        patchPromise: Promise.resolve(),
      },
      runtime: runtimeSet,
      rawSource: rawTailwindCss,
      file: 'app.wxss',
      cssHandlerOptions: {
        isMainChunk: true,
        postcssOptions: {
          options: {
            from: 'app.wxss',
          },
        },
        majorVersion: 4,
      } as any,
      cssUserHandlerOptions: {
        isMainChunk: false,
        postcssOptions: {
          options: {
            from: 'app.wxss',
          },
        },
        majorVersion: 4,
      } as any,
      styleHandler,
      debug: vi.fn(),
    })

    expect(result?.css).toBe(weappCss)
    expect(result?.target).toBe('weapp')
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: runtimeSet,
      target: 'weapp',
    }))
    expect(styleHandler).not.toHaveBeenCalled()
  })

  it('passes appended user css through the mini-program style handler', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}'
    const userCss = '\n.card:hover{color:red}'
    const generateMock = vi.fn(async () => ({
      css: '.w-_b100px_B{width:100px}',
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: runtimeSet,
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
    }))

    const { generateCssByGenerator } = await import('@/bundlers/shared/generator-css')
    const styleHandler = vi.fn(async (code: string) => ({ css: `user:${code}` }))
    const result = await generateCssByGenerator({
      opts: {
        generator: true,
        styleHandler,
      } as any,
      runtimeState: {
        twPatcher: {
          majorVersion: 4,
        } as any,
        patchPromise: Promise.resolve(),
      },
      runtime: runtimeSet,
      rawSource: `${rawTailwindCss}${userCss}`,
      file: 'app.wxss',
      cssHandlerOptions: {
        isMainChunk: true,
        postcssOptions: {
          options: {
            from: 'app.wxss',
          },
        },
        majorVersion: 4,
      } as any,
      cssUserHandlerOptions: {
        isMainChunk: false,
        postcssOptions: {
          options: {
            from: 'app.wxss',
          },
        },
        majorVersion: 4,
      } as any,
      styleHandler,
      debug: vi.fn(),
    })

    expect(result?.css).toBe(`.w-_b100px_B{width:100px}\nuser:${userCss}`)
    expect(styleHandler).toHaveBeenCalledWith(userCss, expect.objectContaining({
      isMainChunk: false,
    }))
  })
})
