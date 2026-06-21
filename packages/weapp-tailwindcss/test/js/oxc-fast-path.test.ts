import { MappingChars2String } from '@weapp-core/escape'
import { describe, expect, it, vi } from 'vitest'
import { createJsHandler } from '@/js'
import { jsHandler } from '@/js/babel'
import { canUseOxcJsFastPath, isOxcParserRuntimeSupported, oxcJsHandler } from '@/js/fast-path/oxc'

function createOptions() {
  return {
    escapeMap: MappingChars2String,
    alwaysEscape: true,
    needEscaped: true,
    unescapeUnicode: true,
    experimentalJsFastPath: 'oxc' as const,
    generateMap: false,
    filename: '/project/pages/index.tsx',
    babelParserOptions: {
      sourceType: 'module' as const,
      plugins: ['typescript', 'jsx'] as any,
    },
  }
}

describe('OXC JS fast path', () => {
  it('keeps OXC behind the runtime versions supported by oxc-parser', () => {
    expect(isOxcParserRuntimeSupported('18.20.8')).toBe(false)
    expect(isOxcParserRuntimeSupported('20.18.1')).toBe(false)
    expect(isOxcParserRuntimeSupported('20.19.0')).toBe(true)
    expect(isOxcParserRuntimeSupported('21.7.3')).toBe(false)
    expect(isOxcParserRuntimeSupported('22.11.0')).toBe(false)
    expect(isOxcParserRuntimeSupported('22.12.0')).toBe(true)
    expect(isOxcParserRuntimeSupported('24.0.0')).toBe(true)
  })

  it('matches Babel output for string, template and JSX literals', () => {
    const options = createOptions()
    const source = [
      'const a = "w-[100px] hover:bg-red-500"',
      'const b = `h-[20px] ${value} mt-2`',
      'const c = <view className="px-[12px]" />',
    ].join('\n')

    const fast = oxcJsHandler(source, options)
    const babel = jsHandler(source, options)

    expect(fast?.code).toBe(babel.code)
    expect(fast?.code).toContain('w-_b100px_B')
    expect(fast?.code).toContain('h-_b20px_B')
    expect(fast?.code).toContain('px-_b12px_B')
  })

  it('walks nested TSX nodes with oxc-walker and keeps Babel output parity', () => {
    const options = createOptions()
    const source = [
      'type Item = { className: string }',
      'const items: Item[] = [{ className: "w-[100px]" }, { className: `h-[20px] ${value} mt-2` }]',
      'const view = <view data-state={{ active: "bg-[red]" }} className={items[0]!.className} />',
    ].join('\n')

    const fast = oxcJsHandler(source, options)
    const babel = jsHandler(source, options)

    expect(fast?.code).toBe(babel.code)
    expect(fast?.code).toContain('w-_b100px_B')
    expect(fast?.code).toContain('h-_b20px_B')
    expect(fast?.code).toContain('bg-_bred_B')
  })

  it('keeps non-class strings unchanged under classNameSet precision', () => {
    const source = 'const message = "not a class"; const cls = "w-[100px]"'
    const options = {
      ...createOptions(),
      alwaysEscape: false,
      classNameSet: new Set(['w-[100px]']),
    }

    const fast = oxcJsHandler(source, options)

    expect(fast?.code).toContain('"not a class"')
    expect(fast?.code).toContain('"w-_b100px_B"')
  })

  it('falls back to Babel when source maps are requested', () => {
    const options = {
      ...createOptions(),
      generateMap: true,
    }

    expect(canUseOxcJsFastPath(options)).toBe(false)
    expect(oxcJsHandler('const cls = "w-[100px]"', options)).toBeUndefined()
  })

  it('falls back to Babel for ignore-call semantics', () => {
    const options = {
      ...createOptions(),
      ignoreCallExpressionIdentifiers: ['cn'],
    }

    expect(canUseOxcJsFastPath(options)).toBe(false)
    expect(oxcJsHandler('cn("w-[100px]")', options)).toBeUndefined()
  })

  it('falls back when arbitrary-value fallback needs Babel class context', () => {
    const options = {
      ...createOptions(),
      alwaysEscape: false,
      jsArbitraryValueFallback: true,
      classNameSet: new Set<string>(),
    }

    expect(canUseOxcJsFastPath(options)).toBe(false)
    expect(oxcJsHandler('const message = "cost-[100px]"', options)).toBeUndefined()
  })

  it('falls back when arbitrary-value fallback is enabled with a runtime class set', () => {
    const options = {
      ...createOptions(),
      alwaysEscape: false,
      jsArbitraryValueFallback: true,
      classNameSet: new Set<string>(['w-[100px]']),
    }

    expect(canUseOxcJsFastPath(options)).toBe(false)
    expect(oxcJsHandler('const cls = "w-[100px]"', options)).toBeUndefined()
  })

  it('createJsHandler uses OXC only when explicitly enabled', () => {
    const source = 'const cls = "w-[100px]"'
    const handler = createJsHandler({
      escapeMap: MappingChars2String,
      alwaysEscape: true,
      generateMap: false,
      experimentalJsFastPath: 'oxc',
    })
    const fallbackHandler = createJsHandler({
      escapeMap: MappingChars2String,
      alwaysEscape: true,
      generateMap: false,
    })

    expect(handler(source, new Set()).code).toBe(fallbackHandler(source, new Set()).code)
  })

  it('falls back to Babel on Node versions unsupported by oxc-parser', async () => {
    vi.resetModules()
    vi.doMock('@/js/babel', () => ({
      jsHandler: vi.fn(() => ({ code: 'babel-fallback' })),
    }))
    vi.doMock('oxc-parser', () => {
      throw new Error('Node 18 must not load oxc-parser')
    })
    vi.doMock('oxc-walker', () => {
      throw new Error('Node 18 must not load oxc-walker')
    })
    vi.spyOn(process.versions, 'node', 'get').mockReturnValue('18.20.8')

    const { createJsHandler: createMockedJsHandler } = await import('@/js')
    const { jsHandler: mockedBabelHandler } = await import('@/js/babel')
    const handler = createMockedJsHandler({
      escapeMap: MappingChars2String,
      alwaysEscape: true,
      generateMap: false,
      experimentalJsFastPath: 'oxc',
    })

    const result = handler('const cls = "w-[100px]"', new Set())

    expect(result.code).toBe('babel-fallback')
    expect(mockedBabelHandler).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
    vi.doUnmock('@/js/babel')
    vi.doUnmock('oxc-parser')
    vi.doUnmock('oxc-walker')
  })

  it('does not call Babel when the OXC fast path succeeds', async () => {
    vi.resetModules()
    vi.doMock('@/js/babel', () => ({
      jsHandler: vi.fn(() => ({ code: 'babel-fallback' })),
    }))

    const { createJsHandler: createMockedJsHandler } = await import('@/js')
    const { jsHandler: mockedBabelHandler } = await import('@/js/babel')
    const handler = createMockedJsHandler({
      escapeMap: MappingChars2String,
      alwaysEscape: true,
      generateMap: false,
      experimentalJsFastPath: 'oxc',
    })

    const result = handler('const cls = "w-[100px]"', new Set())

    expect(result.code).toContain('w-_b100px_B')
    expect(mockedBabelHandler).not.toHaveBeenCalled()
    vi.doUnmock('@/js/babel')
  })

  it('uses OXC for moduleGraph files without dependency edges', async () => {
    vi.resetModules()
    vi.doMock('@/js/babel', () => ({
      jsHandler: vi.fn(() => ({ code: 'babel-fallback' })),
    }))

    const { createJsHandler: createMockedJsHandler } = await import('@/js')
    const { jsHandler: mockedBabelHandler } = await import('@/js/babel')
    const handler = createMockedJsHandler({
      escapeMap: MappingChars2String,
      alwaysEscape: true,
      generateMap: false,
      experimentalJsFastPath: 'oxc',
    })

    const result = handler('const cls = "w-[100px]"', new Set(), {
      filename: '/project/dist/index.js',
      moduleGraph: {
        resolve: vi.fn(),
        load: vi.fn(),
      },
    })

    expect(result.code).toContain('w-_b100px_B')
    expect(mockedBabelHandler).not.toHaveBeenCalled()
    vi.doUnmock('@/js/babel')
  })

  it('keeps Babel moduleGraph semantics when dependencies are present', async () => {
    vi.resetModules()
    vi.doMock('@/js/babel', () => ({
      jsHandler: vi.fn(() => ({
        code: 'babel-module-graph',
        linked: { '/project/dist/shared.js': { code: 'linked' } },
      })),
    }))

    const { createJsHandler: createMockedJsHandler } = await import('@/js')
    const { jsHandler: mockedBabelHandler } = await import('@/js/babel')
    const handler = createMockedJsHandler({
      escapeMap: MappingChars2String,
      alwaysEscape: true,
      generateMap: false,
      experimentalJsFastPath: 'oxc',
    })

    const result = handler('import "./shared.js"; const cls = "w-[100px]"', new Set(), {
      filename: '/project/dist/index.js',
      moduleGraph: {
        resolve: vi.fn(),
        load: vi.fn(),
      },
    })

    expect(result.code).toBe('babel-module-graph')
    expect(result.linked).toEqual({ '/project/dist/shared.js': { code: 'linked' } })
    expect(mockedBabelHandler).toHaveBeenCalledTimes(1)
    vi.doUnmock('@/js/babel')
  })
})
