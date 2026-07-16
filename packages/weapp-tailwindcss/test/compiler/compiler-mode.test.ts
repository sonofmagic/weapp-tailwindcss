import { afterEach, describe, expect, it, vi } from 'vitest'
import { captureFrameworkPostcssOptions } from '@/bundlers/shared/framework-postcss'
import { COMPILER_MODE_ENV, resolveCompilerMode } from '@/compiler/mode'

function createGenerationOptions(debug = vi.fn()) {
  return {
    opts: {} as any,
    runtimeState: {
      tailwindRuntime: { majorVersion: 4 } as any,
      readyPromise: Promise.resolve(),
    },
    runtime: new Set(['p-4']),
    rawSource: '@import "tailwindcss";',
    file: '/workspace/src/app.css',
    outputFile: 'app.css',
    cssHandlerOptions: { isMainChunk: true, majorVersion: 4 } as any,
    cssUserHandlerOptions: {} as any,
    styleHandler: vi.fn(async (css: string) => ({ css })),
    debug,
  }
}

function createGeneratedResult(css: string) {
  return {
    css,
    target: 'web',
    classSet: new Set(['p-4']),
    dependencies: [],
    source: 'generator' as const,
    metadata: {
      file: '/workspace/src/app.css',
      outputFile: 'app.css',
    },
  }
}

describe('compiler mode', () => {
  const originalMode = process.env[COMPILER_MODE_ENV]

  afterEach(() => {
    if (originalMode === undefined) {
      delete process.env[COMPILER_MODE_ENV]
    }
    else {
      process.env[COMPILER_MODE_ENV] = originalMode
    }
    vi.doUnmock('@/bundlers/shared/generator-css')
    vi.resetModules()
  })

  it('defaults to legacy and accepts explicit modes', () => {
    expect(resolveCompilerMode({})).toBe('legacy')
    expect(resolveCompilerMode({ [COMPILER_MODE_ENV]: 'legacy' })).toBe('legacy')
    expect(resolveCompilerMode({ [COMPILER_MODE_ENV]: 'shadow' })).toBe('shadow')
  })

  it('keeps the default legacy path free of artifact parsing', async () => {
    delete process.env[COMPILER_MODE_ENV]
    const generateCssByGenerator = vi.fn(async () => createGeneratedResult('.p-4 { padding: 1rem; }'))
    vi.doMock('@/bundlers/shared/generator-css', () => ({ generateCssByGenerator }))
    const { generateTailwindV4Css } = await import('@/bundlers/shared/v4-generation-core')

    const result = await generateTailwindV4Css(createGenerationOptions())

    expect(generateCssByGenerator).toHaveBeenCalledTimes(1)
    expect(result?.artifact).toBeUndefined()
  })

  it('uses the root framework adapter in graph mode', async () => {
    process.env[COMPILER_MODE_ENV] = 'graph'
    const generateCssByGenerator = vi.fn(async (options: { deferCssAdaptation?: boolean }) => {
      expect(options.deferCssAdaptation).toBe(true)
      return createGeneratedResult('.token { color: framework-token; }')
    })
    vi.doMock('@/bundlers/shared/generator-css', () => ({ generateCssByGenerator }))
    const { generateTailwindV4Css } = await import('@/bundlers/shared/v4-generation-core')
    const transformRoot = vi.fn(async (root: any) => {
      root.walkDecls((decl: any) => {
        decl.value = decl.value.replace('framework-token', 'processed-token')
      })
      return root.toResult()
    })
    const styleHandler = Object.assign(
      vi.fn(async (css: string) => ({ css })),
      { transformRoot },
    )
    const owner = {
      cssPreflight: false,
      generator: { target: 'weapp' },
      styleHandler,
    } as any
    captureFrameworkPostcssOptions(owner, {
      plugins: [{ postcssPlugin: 'framework-plugin' }],
    })

    const result = await generateTailwindV4Css({
      ...createGenerationOptions(),
      opts: owner,
      frameworkPostcssOwner: owner,
      frameworkPostcssStage: 'complete',
      styleHandler,
    })

    expect(transformRoot).toHaveBeenCalledTimes(1)
    expect(result?.css).toContain('processed-token')
    expect(result?.artifact.fragments[0]?.root.toString()).toContain('processed-token')
  })

  it('runs both implementations in shadow mode and returns legacy output', async () => {
    process.env[COMPILER_MODE_ENV] = 'shadow'
    const generateCssByGenerator = vi.fn(async () => createGeneratedResult('.p-4 { padding: 1rem; }'))
    vi.doMock('@/bundlers/shared/generator-css', () => ({ generateCssByGenerator }))
    const { generateTailwindV4Css } = await import('@/bundlers/shared/v4-generation-core')
    const debug = vi.fn()

    const result = await generateTailwindV4Css(createGenerationOptions(debug))

    expect(generateCssByGenerator).toHaveBeenCalledTimes(2)
    expect(result?.css).toContain('padding')
    expect(result?.artifact.fragments).toHaveLength(1)
    expect(debug).not.toHaveBeenCalledWith(expect.stringContaining('semantic mismatch'), expect.anything())
  })

  it('reports semantic differences in shadow mode', async () => {
    process.env[COMPILER_MODE_ENV] = 'shadow'
    const generateCssByGenerator = vi.fn()
      .mockResolvedValueOnce(createGeneratedResult('.p-4 { padding: 1rem; }'))
      .mockResolvedValueOnce(createGeneratedResult('.p-4 { padding: 2rem; }'))
    vi.doMock('@/bundlers/shared/generator-css', () => ({ generateCssByGenerator }))
    const { generateTailwindV4Css } = await import('@/bundlers/shared/v4-generation-core')
    const debug = vi.fn()

    const result = await generateTailwindV4Css(createGenerationOptions(debug))

    expect(result?.css).toContain('1rem')
    expect(debug).toHaveBeenCalledWith('compiler shadow semantic mismatch: %s', '/workspace/src/app.css')
  })
})
