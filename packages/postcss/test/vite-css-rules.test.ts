import { describe, expect, it } from 'vitest'
import { filterExistingCssRules } from '../src/vite-css-rules'

describe('vite css rule helpers', () => {
  it('treats var fallback declarations as covered by the fallback value', () => {
    const baseCss = '.card{color:#175e75;color:var(--card-color,#175e75);display:inline-flex}'
    const css = '.card{color:var(--card-color,#175e75);display:inline-flex}'

    expect(filterExistingCssRules(baseCss, css)).toBe('')
  })

  it('treats generated fallback declarations as covered by the original var fallback', () => {
    const baseCss = '.card{color:var(--card-color,#175e75);display:inline-flex}'
    const css = '.card{color:#175e75;color:var(--card-color,#175e75);display:inline-flex}'

    expect(filterExistingCssRules(baseCss, css)).toBe('')
  })

  it('keeps var fallback declarations when the fallback value differs', () => {
    const baseCss = '.card{color:#175e75;display:inline-flex}'
    const css = '.card{color:var(--card-color,#0f172a);display:inline-flex}'

    expect(filterExistingCssRules(baseCss, css)).toBe(css)
  })
})
