import { describe, expect, it } from 'vitest'
import { declarationMatches } from './lynx/static-evidence'

describe('Lynx static declaration evidence', () => {
  it('requires an expected value to match instead of accepting the property name alone', () => {
    expect(declarationMatches(
      { property: 'width', value: '100px' },
      { property: 'width', value: '200px' },
      true,
    )).toBe(false)
  })

  it('normalizes insignificant whitespace and enforces important when requested', () => {
    expect(declarationMatches(
      { property: 'min-width', value: 'calc(100%  -  2rem)', important: true },
      { property: 'min-width', value: 'calc(100% - 2rem)', important: true },
      true,
    )).toBe(true)
    expect(declarationMatches(
      { property: 'display', value: 'flex' },
      { property: 'display', value: 'flex', important: true },
      true,
    )).toBe(false)
  })

  it('allows a property-only expectation for values that vary by Tailwind internals', () => {
    expect(declarationMatches(
      { property: 'box-shadow', value: '0 10px 15px rgb(0 0 0 / 0.1)' },
      { property: 'box-shadow' },
      true,
    )).toBe(true)
  })
})
