import postcss from 'postcss'
import { commonChunkPreflight } from '@/mp'

describe('mp', () => {
  it('commonChunkPreflight case 0', () => {
    const root = postcss.parse('.foo { color: red; }')
    commonChunkPreflight(root.first as postcss.Rule, {})
    expect(root.toString()).toBe('.foo { color: red; }')
  })

  it('commonChunkPreflight case 1', () => {
    const root = postcss.parse(':root,:host { color: red; }')
    commonChunkPreflight(root.first as postcss.Rule, {})
    expect(root.toString()).toBe(':root,:host { color: red; }')
  })

  it('commonChunkPreflight appends :host when only :root exists', () => {
    const root = postcss.parse(':root { color: red; }')
    commonChunkPreflight(root.first as postcss.Rule, {})
    expect(root.toString()).toBe(':root, :host { color: red; }')
  })

  it('commonChunkPreflight case 2', () => {
    const root = postcss.parse(':root,:host { color: red; }')
    commonChunkPreflight(root.first as postcss.Rule, { injectAdditionalCssVarScope: true })
    expect(root.toString()).toBe(':root,:host { color: red; }')
  })

  it('commonChunkPreflight does not inject pseudo content init into v4 root scopes', () => {
    const root = postcss.parse(':root,:host { --color-red-500: red; }')
    commonChunkPreflight(root.first as postcss.Rule, { injectAdditionalCssVarScope: true, majorVersion: 4 })
    const css = root.toString()
    expect(css).not.toContain('--tw-content')
    expect(css).toContain('--color-red-500')
    expect(css).toContain(':root,:host')
  })

  it('commonChunkPreflight injects only used Tailwind v4 variables', () => {
    const root = postcss.parse([
      ':root,:host { --color-red-500: red; }',
      '.bg-gradient-to-t {',
      '  --tw-gradient-position: to top;',
      '  background-image: linear-gradient(var(--tw-gradient-stops));',
      '}',
      '.shadow { box-shadow: var(--tw-shadow); }',
    ].join('\n'))
    commonChunkPreflight(root.first as postcss.Rule, { injectAdditionalCssVarScope: true, majorVersion: 4 })
    const css = root.toString()

    expect(css).toContain('--tw-gradient-position: initial')
    expect(css).toContain('--tw-gradient-stops: initial')
    expect(css).toContain('--tw-shadow: 0 0 #0000')
    expect(css).not.toContain('--tw-content')
    expect(css).not.toContain('--tw-scrollbar-thumb')
    expect(css).not.toContain('--tw-translate-x')
  })

  it('commonChunkPreflight injects Tailwind v4 content init only when content variable is used', () => {
    const root = postcss.parse([
      ':root,:host { --color-red-500: red; }',
      '.before\\:content-\\[\\\"x\\\"\\]::before {',
      '  --tw-content: "x";',
      '  content: var(--tw-content);',
      '}',
    ].join('\n'))
    commonChunkPreflight(root.first as postcss.Rule, { injectAdditionalCssVarScope: true, majorVersion: 4 })
    const css = root.toString()

    expect(css).toContain('--tw-content: ""')
    expect(css).toContain('--tw-content: "x"')
    expect(css).toContain('content: var(--tw-content)')
    expect(css).not.toContain('--tw-gradient-stops')
  })
})
