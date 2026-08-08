import { transformLynxCssCompat, transformWebCssCompat } from '@/index'

describe('Lynx CSS compatibility transform', () => {
  it('inlines Tailwind theme values and reduces static calculations', () => {
    const css = [
      ':root, :host {',
      '  --color-sky-500: rgb(0, 165, 234);',
      '  --spacing: 0.25rem;',
      '  --text-lg: 1.125rem;',
      '  --text-lg--line-height: calc(1.75 / 1.125);',
      '  --font-weight-bold: 700;',
      '  --default-font-family: var(--font-sans);',
      '}',
      '.bg-sky-500 { background-color: var(--color-sky-500); }',
      '.p-6 { padding: calc(var(--spacing) * 6); }',
      '.text-lg { font-size: var(--text-lg); line-height: var(--tw-leading, var(--text-lg--line-height)); }',
      '.font-bold { --tw-font-weight: var(--font-weight-bold); font-weight: var(--font-weight-bold); }',
    ].join('\n')

    const result = transformLynxCssCompat(css)

    expect(result).toContain('background-color: rgb(0, 165, 234)')
    expect(result).toContain('padding: 1.5rem')
    expect(result).toContain('font-size: 1.125rem')
    expect(result).toContain('line-height: var(--tw-leading, 1.55556)')
    expect(result).toContain('font-weight: 700')
    expect(result).toContain('--tw-font-weight: 700')
    expect(result).not.toContain('var(--spacing)')
    expect(result).not.toContain('--color-sky-500:')
    expect(result).not.toContain('--default-font-family:')
  })

  it('preserves authored dynamic variables and literal arbitrary values', () => {
    const css = [
      ':root { --brand-color: #123456; --spacing: 0.25rem; }',
      '.dynamic { background: var(--brand-color); width: var(--panel-width, 20px); }',
      '.arbitrary { color: #c31d6b; padding: 13px; }',
    ].join('\n')

    const result = transformLynxCssCompat(css)

    expect(result).toContain('--brand-color: #123456')
    expect(result).toContain('background: var(--brand-color)')
    expect(result).toContain('width: var(--panel-width, 20px)')
    expect(result).toContain('color: #c31d6b')
    expect(result).toContain('padding: 13px')
  })

  it('runs after legacy web color normalization', () => {
    const webCss = transformWebCssCompat([
      '@theme { --color-sky-500: oklch(68.5% 0.169 237.323); }',
      '@layer utilities { .bg-sky-500 { background-color: var(--color-sky-500); } }',
    ].join('\n'), true)
    const result = transformLynxCssCompat(webCss)

    expect(result).toContain('.bg-sky-500')
    expect(result).toContain('background-color: rgb(')
    expect(result).not.toContain('oklch(')
    expect(result).not.toContain('var(--color-sky-500)')
  })
})
