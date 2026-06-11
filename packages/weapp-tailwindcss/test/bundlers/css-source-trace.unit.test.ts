import { describe, expect, it } from 'vitest'
import { annotateCssSourceTrace, createCssSourceTraceCacheSignature, createCssTokenSourceMap } from '@/bundlers/shared/css-source-trace'
import type { InternalUserDefinedOptions } from '@/types'

function createOptions(options: {
  cssSourceTrace?: InternalUserDefinedOptions['cssSourceTrace']
  root?: string
} = {}) {
  return {
    cssSourceTrace: options.cssSourceTrace ?? false,
    tailwindcssBasedir: options.root ?? '/repo/demo',
  } as InternalUserDefinedOptions
}

describe('bundlers/shared css source trace', () => {
  it('keeps css unchanged when cssSourceTrace is disabled', () => {
    const css = '.rotate-y-90 { transform: rotateY(90deg); }'
    const tokenSources = createCssTokenSourceMap(new Map([
      ['rotate-y-90', new Set(['/repo/demo/src/pages/index.tsx'])],
    ]), createOptions())

    expect(annotateCssSourceTrace(css, {
      opts: createOptions(),
      tokenSources,
    })).toBe(css)
  })

  it('annotates matched utility rules with token source files', () => {
    const opts = createOptions({ cssSourceTrace: true })
    const tokenSources = createCssTokenSourceMap(new Map([
      ['rotate-y-90', new Set(['/repo/demo/src/pages/issue-909/index.tsx'])],
      ['bg-[#123456]', new Set(['/repo/demo/src/components/palette.tsx'])],
    ]), opts)

    const traced = annotateCssSourceTrace([
      '.rotate-y-90 { transform: rotateY(90deg); }',
      '.bg-_b_h123456_B { background-color: #123456; }',
    ].join('\n'), {
      opts,
      tokenSources,
    })

    expect(traced).toContain('/* tokens: rotate-y-90 <= src/pages/issue-909/index.tsx */')
    expect(traced).toContain('/* tokens: bg-[#123456] <= src/components/palette.tsx */')
  })

  it('uses token source details in cache signatures only when enabled', () => {
    const disabled = createOptions()
    const enabled = createOptions({ cssSourceTrace: true })
    const tokenSources = createCssTokenSourceMap(new Map([
      ['h-8', new Set(['/repo/demo/src/a.tsx'])],
    ]), enabled)

    expect(createCssSourceTraceCacheSignature(tokenSources, disabled)).toBe('css-source-trace:0')
    expect(createCssSourceTraceCacheSignature(tokenSources, enabled)).toContain('h-8<=src/a.tsx')
  })
})
