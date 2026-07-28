import { transformUniAppWebviewCssCompat } from '@/index'

describe('uni-app WebView css compatibility transform', () => {
  it('resolves Tailwind CSS v4 spacing calculations without breaking reverse utilities', () => {
    const css = [
      ':root { --spacing: 0.25rem; }',
      '.p-5 { padding: calc(var(--spacing) * 5); }',
      '.space-y-5 > :not(:last-child) {',
      '  --tw-space-y-reverse: 0;',
      '  margin-block-start: calc(calc(var(--spacing) * 5) * var(--tw-space-y-reverse));',
      '  margin-block-end: calc(calc(var(--spacing) * 5) * calc(1 - var(--tw-space-y-reverse)));',
      '}',
      '.space-y-reverse > :not(:last-child) { --tw-space-y-reverse: 1; }',
      '.safe-area { padding-bottom: calc(1.5rem + env(safe-area-inset-bottom)); }',
    ].join('\n')
    const result = transformUniAppWebviewCssCompat(css)

    expect(result).toContain('padding: 1.25rem')
    expect(result).toContain('margin-block-start: calc(1.25rem*var(--tw-space-y-reverse))')
    expect(result).toContain('margin-block-end: calc(1.25rem*(1 - var(--tw-space-y-reverse)))')
    expect(result).toContain('--tw-space-y-reverse: 1')
    expect(result).not.toContain('var(--spacing)')
    expect(result).toContain('calc(1.5rem + env(safe-area-inset-bottom))')
  })

  it('adds the WebKit text clip fallback once', () => {
    const css = [
      '.title { background-clip: text; }',
      '.prefixed { -WEBKIT-background-clip: text; background-clip: text; }',
    ].join('\n')
    const result = transformUniAppWebviewCssCompat(css)

    expect(result).toContain('.title { -webkit-background-clip: text; background-clip: text; }')
    expect(result.match(/-webkit-background-clip: text/gi)).toHaveLength(2)
  })
})
