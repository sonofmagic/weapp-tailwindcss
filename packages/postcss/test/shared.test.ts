import type { IMangleScopeContext } from '@weapp-tailwindcss/mangle'
import { composeIsPseudo, internalCssSelectorReplacer } from '@/shared'

describe('internalCssSelectorReplacer', () => {
  it('applies the default escape mapping', () => {
    expect(internalCssSelectorReplacer('.btn:hover>view+text')).toBe('dbtnchovergviewatext')
  })

  it('respects custom escape maps', () => {
    const value = internalCssSelectorReplacer('view>text.btn', {
      escapeMap: {
        '.': 'DOT',
        '>': 'GT',
      },
    })

    expect(value).toBe('viewGTtextDOTbtn')
  })

  it('runs the mangle css handler before escaping', () => {
    const mangleContext = {
      cssHandler: (raw: string) => raw.replace('primary', 'p'),
    } as unknown as IMangleScopeContext

    const value = internalCssSelectorReplacer('.primary:hover', {
      mangleContext,
    })

    expect(value).toBe('dpchover')
  })
})

describe('composeIsPseudo', () => {
  it('passes strings through unchanged', () => {
    expect(composeIsPseudo(':hover')).toBe(':hover')
  })

  it('unwraps single-item arrays', () => {
    expect(composeIsPseudo([':focus-visible'])).toBe(':focus-visible')
  })

  it('wraps multiple selectors in :is()', () => {
    expect(composeIsPseudo([':hover', ':focus'])).toBe(':is(:hover,:focus)')
  })
})
