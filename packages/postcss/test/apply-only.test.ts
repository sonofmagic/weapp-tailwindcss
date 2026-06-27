import {
  collectApplyOnlyCssSelectors,
  collectApplyOnlyCssSelectorsRoot,
  filterApplyOnlyGeneratedCss,
  filterApplyOnlyGeneratedCssRoot,
  postcss,
} from '@/index'

describe('apply-only css helpers', () => {
  it('collects apply-only selectors from strings and roots', () => {
    const css = [
      '.card:not(#\\#) { @apply flex; }',
      '@media (any-hover: hover) {',
      '  .card:hover { @apply opacity-80; }',
      '}',
      '.ordinary { color: red; }',
    ].join('\n')

    expect(collectApplyOnlyCssSelectors(css)).toEqual(new Set([
      '.card',
      '.card:hover',
    ]))
    expect(collectApplyOnlyCssSelectorsRoot(postcss.parse(css))).toEqual(new Set([
      '.card',
      '.card:hover',
    ]))
  })

  it('filters generated css to apply-only selectors while preserving custom properties', () => {
    const selectors = new Set(['.card', '.card:hover'])
    const generatedCss = [
      '@layer utilities {',
      '  .card { display: flex; }',
      '  .card:hover { opacity: .8; }',
      '  .unused { color: red; }',
      '  :root { --spacing: 0.25rem; }',
      '}',
    ].join('\n')

    expect(filterApplyOnlyGeneratedCss(generatedCss, selectors)).toBe([
      '@layer utilities {',
      '  .card { display: flex; }',
      '  .card:hover { opacity: .8; }',
      '  :root { --spacing: 0.25rem; }',
      '}',
    ].join('\n'))
  })

  it('filters generated css from an existing root without reparsing selector source css', () => {
    const root = postcss.parse([
      '@media (min-width: 768px) {',
      '  .unused { color: red; }',
      '}',
      '.card { display: flex; }',
    ].join('\n'))

    expect(filterApplyOnlyGeneratedCssRoot(root, new Set(['.card']))).toBe(true)
    expect(root.toString()).toBe('.card { display: flex; }')
  })

  it('keeps generated css unchanged when no apply-only selector was collected', () => {
    const css = '.unused { color: red; }'

    expect(filterApplyOnlyGeneratedCss(css, new Set())).toBe(css)
    const root = postcss.parse(css)
    expect(filterApplyOnlyGeneratedCssRoot(root, new Set())).toBe(false)
    expect(root.toString()).toBe(css)
  })
})
