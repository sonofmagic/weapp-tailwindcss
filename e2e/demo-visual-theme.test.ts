import { PNG } from 'pngjs'
import { describe, expect, it } from 'vitest'
import { analyzeThemeCss, countDarkPixels } from '../scripts/demo-visual-e2e-report/theme'

describe('demo visual theme evidence', () => {
  it('detects system and manual dark mode selectors in mini-program css output', () => {
    const css = [
      '@media (prefers-color-scheme: dark) { .system-dark_cbg-slate-900 { background-color: #0f172a; } }',
      '.theme-dark .dark_cbg-zinc-950 { background-color: #09090b; }',
    ].join('\n')

    expect(analyzeThemeCss(css)).toEqual({
      hasManualDarkSelector: true,
      hasUnsupportedThemeAttributeSelector: false,
      hasUnsupportedThemeComplexSelector: false,
      hasSystemDarkMedia: true,
    })
  })

  it('rejects mini-program unsupported attribute and complex selectors', () => {
    expect(analyzeThemeCss('.theme-dark [disabled] { opacity: .5 }').hasUnsupportedThemeAttributeSelector).toBe(true)
    expect(analyzeThemeCss('.dark_cbg-zinc-900:not(view):not(text) { background: #000 }').hasUnsupportedThemeComplexSelector).toBe(true)
    expect(analyzeThemeCss('.theme-dark:where(.active, .current) { color: #fff }').hasUnsupportedThemeComplexSelector).toBe(true)
    expect(analyzeThemeCss('.t-button__content:not(:empty) { display: inline }').hasUnsupportedThemeComplexSelector).toBe(false)
  })

  it('keeps third-party attribute selectors outside theme selector checks', () => {
    const evidence = analyzeThemeCss(`.nut-rtl .nut-toast,
[dir='rtl'] .nut-toast {
  left: auto;
  right: 0;
}
.theme-dark .dark_cbg-zinc-950 {
  background-color: #09090b;
}`)
    expect(evidence.hasManualDarkSelector).toBe(true)
    expect(evidence.hasUnsupportedThemeAttributeSelector).toBe(false)
    expect(evidence.hasUnsupportedThemeComplexSelector).toBe(false)
  })

  it('counts dark pixels inside the sampled screenshot rectangle', () => {
    const png = new PNG({ height: 4, width: 4 })
    png.data.fill(255)
    for (let y = 1; y <= 2; y++) {
      for (let x = 1; x <= 2; x++) {
        const index = (png.width * y + x) * 4
        png.data[index] = 9
        png.data[index + 1] = 9
        png.data[index + 2] = 11
        png.data[index + 3] = 255
      }
    }

    expect(countDarkPixels(png, { height: 2, left: 1, top: 1, width: 2 })).toBe(4)
    expect(countDarkPixels(png, { height: 1, left: 0, top: 0, width: 1 })).toBe(0)
  })
})
