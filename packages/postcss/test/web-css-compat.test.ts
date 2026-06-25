import { normalizeWebCssCompatOptions, transformWebCssCompat } from '@/index'

describe('web css compatibility transform', () => {
  it('keeps css unchanged by default', () => {
    const css = '@layer utilities { .text-blue { color: oklch(62.3% .214 259.815); } }'

    expect(transformWebCssCompat(css, undefined)).toBe(css)
  })

  it('keeps css unchanged with off preset and disabled feature overrides', () => {
    const css = [
      '@layer utilities { .text-blue { color: oklch(62.3% .214 259.815); } }',
      '@supports (display: grid) { .grid { display: grid; } }',
    ].join('\n')

    expect(transformWebCssCompat(css, { preset: 'off' })).toBe(css)
    expect(transformWebCssCompat(css, {
      preset: 'legacy-web',
      features: {
        theme: false,
        layer: false,
        property: false,
        oklch: false,
        colorFunctions: false,
        supports: false,
      },
    })).toBe(css)
  })

  it('normalizes Tailwind CSS v4 runtime features with legacy-web preset', () => {
    const css = [
      '@theme { --color-blue-500: oklch(62.3% .214 259.815); }',
      '@layer utilities { .text-blue { color: var(--color-blue-500); } }',
      '@property --tw-rotate-x { syntax: "*"; inherits: false; }',
      '@supports (color: color-mix(in lab, red, red)) {',
      '  .bg-blue\\/50 { background-color: color-mix(in oklab, var(--color-blue-500) 50%, transparent); }',
      '}',
    ].join('\n')
    const result = transformWebCssCompat(css, true)

    expect(result).not.toContain('@theme')
    expect(result).not.toContain('@layer')
    expect(result).not.toContain('@property')
    expect(result).not.toContain('@supports')
    expect(result).not.toContain('oklch(')
    expect(result).toContain(':root')
    expect(result).toContain('--color-blue-500: rgb(')
    expect(result).toContain('.text-blue')
    expect(result).toContain('.bg-blue\\/50')
  })

  it('snapshots web and web compat css output differences', () => {
    const web = [
      '@theme {',
      '  --color-blue-500: oklch(62.3% .214 259.815);',
      '  --shadow-card: 0 8px 24px color-mix(in oklab, var(--color-blue-500) 18%, transparent);',
      '  @keyframes enter { from { opacity: 0; } to { opacity: 1; } }',
      '}',
      '@layer utilities {',
      '  .text-blue { color: var(--color-blue-500); }',
      '  .shadow-card { box-shadow: var(--shadow-card); }',
      '}',
      '@property --tw-rotate-x { syntax: "*"; inherits: false; initial-value: 0; }',
      '@supports (color: color-mix(in lab, red, red)) {',
      '  .bg-blue\\/50 { background-color: color-mix(in oklab, var(--color-blue-500) 50%, transparent); }',
      '}',
    ].join('\n')
    const webCompat = transformWebCssCompat(web, true)

    expect({
      web,
      webCompat,
    }).toMatchSnapshot()
  })

  it('hoists non-declaration theme nodes outside root rule', () => {
    const css = '@theme { --color-blue-500: oklch(62.3% .214 259.815); @keyframes enter { to { opacity: 1; } } }'
    const result = transformWebCssCompat(css, { features: { theme: true, oklch: true } })

    expect(result).toContain(':root')
    expect(result).toContain('--color-blue-500: rgb(')
    expect(result).toContain('@keyframes enter')
    expect(result).not.toContain(':root {\n    @keyframes')
  })

  it('removes empty theme rules and preserves theme at-rules without root declarations', () => {
    expect(transformWebCssCompat('@theme {}', { features: { theme: true } })).toBe('')
    expect(transformWebCssCompat('@theme { @keyframes enter { to { opacity: 1; } } }', {
      features: {
        theme: true,
      },
    }).trim()).toBe('@keyframes enter { to { opacity: 1; } }')
  })

  it('allows feature-level overrides', () => {
    const css = [
      '@theme { --color-blue-500: oklch(62.3% .214 259.815); }',
      '@property --tw-rotate-x { syntax: "*"; inherits: false; }',
    ].join('\n')
    const result = transformWebCssCompat(css, {
      preset: 'legacy-web',
      features: {
        theme: false,
      },
    })

    expect(result).toContain('@theme')
    expect(result).not.toContain('@property')
  })

  it('supports individual feature switches', () => {
    const css = [
      '@supports (display: grid) { .grid { display: grid; } }',
      '@supports (color: color-mix(in lab, red, red)) { .mix { color: color-mix(in oklab, red 50%, transparent); } }',
      '.plain { color: rgb(255 0 0 / 50%); }',
      '.modern { color: oklch(62.3% .214 259.815); }',
      '.mix2 { color: color-mix(in srgb, red 50%, transparent); }',
    ].join('\n')

    const keepSupports = transformWebCssCompat(css, {
      features: {
        supports: false,
        colorFunctions: true,
        oklch: true,
      },
    })
    const keepModernColors = transformWebCssCompat(css, {
      features: {
        supports: true,
        colorFunctions: false,
        oklch: false,
      },
    })

    expect(keepSupports).toContain('@supports (display: grid)')
    expect(keepSupports).toContain('@supports (color: color-mix')
    expect(keepSupports).not.toContain('oklch(')
    expect(keepModernColors).toContain('@supports (display: grid)')
    expect(keepModernColors).not.toContain('@supports (color: color-mix')
    expect(keepModernColors).toContain('oklch(')
    expect(keepModernColors).toContain('color-mix(')
  })

  it('does not downgrade non-oklch color functions when color functions are disabled', () => {
    const css = '.mix { color: color-mix(in srgb, red 50%, transparent); }'
    const result = transformWebCssCompat(css, {
      features: {
        oklch: true,
        colorFunctions: false,
      },
    })

    expect(result).toBe(css)
  })

  it('can normalize colors without changing layer or property at-rules', () => {
    const css = [
      '@layer utilities { .text-blue { color: oklch(62.3% .214 259.815); } }',
      '@property --tw-rotate-x { syntax: "*"; inherits: false; }',
    ].join('\n')
    const result = transformWebCssCompat(css, {
      preset: 'off',
      features: {
        oklch: true,
      },
    })

    expect(result).toContain('@layer')
    expect(result).toContain('@property')
    expect(result).not.toContain('oklch(')
  })

  it('removes empty modern supports and empty layer at-rules', () => {
    const css = [
      '@supports (color: oklch(0% 0 0)) {}',
      '@layer utilities {}',
      '@media (min-width: 768px) {}',
    ].join('\n')

    expect(transformWebCssCompat(css, {
      features: {
        layer: true,
        supports: true,
      },
    })).toBe('')
  })

  it('falls back to original css when parsing fails', () => {
    const css = '@layer utilities { .broken { color: red; }'

    expect(transformWebCssCompat(css, true)).toBe(css)
  })

  it('normalizes option presets', () => {
    expect(normalizeWebCssCompatOptions(undefined)).toMatchObject({
      preset: 'off',
      features: {
        layer: false,
      },
    })
    expect(normalizeWebCssCompatOptions(true)).toMatchObject({
      preset: 'legacy-web',
      features: {
        layer: true,
        property: true,
      },
    })
    expect(normalizeWebCssCompatOptions({
      preset: 'off',
      features: {
        property: true,
      },
    })).toMatchObject({
      preset: 'off',
      features: {
        layer: false,
        property: true,
      },
    })
  })
})
