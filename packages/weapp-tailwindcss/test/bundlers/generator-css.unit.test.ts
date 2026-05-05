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

  it('keeps local import wrapper assets out of forced generator replacement', async () => {
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
      runtime: new Set(['w-[100px]']),
      rawSource: '@import "styles/app252bdc3c.wxss";\n',
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

    expect(result).toBeUndefined()
    expect(styleHandler).not.toHaveBeenCalled()
  })

  it('keeps transformed bundle css when forced generator cannot split raw tailwind output', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawSource = '.third-party:hover{color:red}'
    const rawTailwindCss = '.w-\\[100px\\]{width:100px}'
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
      rawSource,
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
    expect(styleHandler).not.toHaveBeenCalled()
  })

  it('replaces tailwind generated css embedded after existing bundle css', async () => {
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
    const styleHandler = vi.fn(async (code: string) => ({ css: `user:${code}` }))
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
      rawSource: `.existing{color:red}\n${rawTailwindCss}\n/*$vite$:1*/`,
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

    expect(result?.css).toBe(`${weappCss}\nuser:.existing{color:red}\n\n\n/*$vite$:1*/`)
    expect(styleHandler).toHaveBeenCalledWith('.existing{color:red}\n\n\n/*$vite$:1*/', expect.objectContaining({
      isMainChunk: false,
    }))
  })

  it('removes appended tailwind banner block when raw css cannot be split exactly', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const generatedRawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}'
    const appendedRawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n@supports (display:grid){.w-\\[100px\\]{width:100px}}'
    const weappCss = '.w-_b100px_B{width:100px}'
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: generatedRawTailwindCss,
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
      rawSource: `.existing{color:red}\n${appendedRawTailwindCss}\n/*$vite$:1*/`,
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

    expect(result?.css).toBe(`${weappCss}\nuser:.existing{color:red}\n\n/*$vite$:1*/`)
    expect(result?.css).not.toContain('@supports')
    expect(result?.css).not.toContain('tailwindcss v')
    expect(styleHandler).toHaveBeenCalledWith('.existing{color:red}\n\n/*$vite$:1*/', expect.objectContaining({
      isMainChunk: false,
    }))
  })

  it('generates scoped tailwind css assets outside the main chunk', async () => {
    const runtimeSet = new Set(['bg-emerald-500'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.bg-emerald-500:not(#\\#){background-color:rgb(0,185,129)}'
    const weappCss = '.bg-emerald-500{background-color:rgb(0,185,129)}'
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
      file: 'pages-order/pages/home/home.wxss',
      cssHandlerOptions: {
        isMainChunk: false,
        postcssOptions: {
          options: {
            from: 'pages-order/pages/home/home.wxss',
          },
        },
        majorVersion: 4,
      } as any,
      cssUserHandlerOptions: {
        isMainChunk: false,
        postcssOptions: {
          options: {
            from: 'pages-order/pages/home/home.wxss',
          },
        },
        majorVersion: 4,
      } as any,
      styleHandler,
      debug: vi.fn(),
    })

    expect(result?.css).toBe(weappCss)
    expect(styleHandler).not.toHaveBeenCalled()
  })
})
