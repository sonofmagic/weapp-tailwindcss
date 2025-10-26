import { afterEach, describe, expect, it, vi } from 'vitest'
import { createJsHandler } from '@/js'
import * as babel from '@/js/babel'

function createBaseOptions() {
  return {
    escapeMap: { base: '_' },
    arbitraryValues: { allowDoubleQuotes: true },
    jsPreserveClass: vi.fn(),
    generateMap: true,
    babelParserOptions: { sourceType: 'module' as const },
    ignoreCallExpressionIdentifiers: ['cn'],
    ignoreTaggedTemplateExpressionIdentifiers: [/^styled$/],
    uniAppX: true,
  }
}

describe('createJsHandler', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('merges base options with per-call overrides', () => {
    const spy = vi.spyOn(babel, 'jsHandler').mockReturnValue({ code: 'ok' })
    const base = createBaseOptions()
    const handler = createJsHandler(base)
    const override = {
      needEscaped: false,
      escapeMap: { override: '_' },
      ignoreCallExpressionIdentifiers: [/^override$/],
    }
    const classNameSet = new Set(['foo'])

    const result = handler('raw-source', classNameSet, override)

    expect(result.code).toBe('ok')
    expect(spy).toHaveBeenCalledTimes(1)

    const [, resolved] = spy.mock.calls[0]

    expect(resolved.classNameSet).toBe(classNameSet)
    expect(resolved.classNameSet).toBe(classNameSet)
    expect(resolved.escapeMap).toMatchObject(override.escapeMap)
    expect(resolved.escapeMap!.base).toBe(base.escapeMap.base)
    expect(resolved.arbitraryValues).toBe(base.arbitraryValues)
    expect(resolved.jsPreserveClass).toBe(base.jsPreserveClass)
    expect(resolved.generateMap).toBe(true)
    expect(resolved.babelParserOptions).toBe(base.babelParserOptions)
    expect(resolved.babelParserOptions).toBe(base.babelParserOptions)
    expect(resolved.ignoreTaggedTemplateExpressionIdentifiers).toBe(base.ignoreTaggedTemplateExpressionIdentifiers)
    expect(resolved.uniAppX).toBe(true)
  })

  it('reuses the cached configuration when no overrides are supplied', () => {
    const spy = vi.spyOn(babel, 'jsHandler').mockReturnValue({ code: 'secondary' })
    const base = createBaseOptions()
    const handler = createJsHandler(base)

    const output = handler('another-source')

    expect(output.code).toBe('secondary')
    expect(spy).toHaveBeenCalledTimes(1)

    const [, resolved] = spy.mock.calls[0]
    expect(resolved.classNameSet).toBeUndefined()
    expect(resolved.escapeMap).toBe(base.escapeMap)
    expect(resolved.ignoreCallExpressionIdentifiers).toBe(base.ignoreCallExpressionIdentifiers)
  })
})
