import { normalizeWebCssCompatOptions, transformWebCssCompat, transformWebCssSafeSelectors } from '@/index'

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
    expect(result).toContain(':root')
    expect(result).toContain('--color-blue-500: rgb(')
    expect(result).not.toContain('--color-blue-500: oklch(')
    expect(result).toContain('.text-blue')
    expect(result).toContain('.bg-blue\\/50')
    expect(result).toContain('background-color: rgba(')
    expect(result).not.toContain('background-color: color-mix(')
  })

  it('resolves Tailwind CSS v4 color variables for legacy WebView background utilities', () => {
    const css = [
      '@theme {',
      '  --color-emerald-500: oklch(69.6% 0.17 162.48);',
      '  --color-zinc-950: oklch(14.1% 0.005 285.823);',
      '  --color-white: #fff;',
      '}',
      '.bg-emerald-500 { background-color: var(--color-emerald-500); }',
      '.bg-white { background-color: var(--color-white); }',
      '.dark\\:bg-zinc-950.theme-dark { background-color: var(--color-zinc-950); }',
      '.theme-dark .dark\\:bg-zinc-950 { background-color: var(--color-zinc-950); }',
    ].join('\n')
    const result = transformWebCssCompat(css, true)

    expect(result).toContain('.bg-emerald-500 { background-color: rgb(')
    expect(result).toContain('.bg-white { background-color: #fff; }')
    expect(result).toContain('.dark\\:bg-zinc-950.theme-dark { background-color: rgb(')
    expect(result).toContain('.theme-dark .dark\\:bg-zinc-950 { background-color: rgb(')
    expect(result).not.toContain('background-color: var(--color-')
    expect(result).not.toContain('oklch(')
  })

  it('maps WebView utility selectors to safe class names without changing declarations', () => {
    const css = [
      '.rounded-\\[20rpx\\] { border-radius: 0.625rem; }',
      '.bg-white\\/70 { background-color: rgba(255, 255, 255, 0.7); }',
      '.text-\\[26rpx\\] { font-size: 0.8125rem; }',
      '.text-slate-700 { color: rgb(49, 65, 88); }',
      '.theme-dark .dark\\:bg-zinc-950 { background-color: rgb(9, 9, 11); }',
    ].join('\n')
    const result = transformWebCssSafeSelectors(css)

    expect(result).toContain('.rounded-_b20rpx_B')
    expect(result).toContain('.bg-white_f70')
    expect(result).toContain('.text-_b26rpx_B')
    expect(result).toContain('.text-slate-700')
    expect(result).toContain('.theme-dark .dark_cbg-zinc-950')
    expect(result).toContain('background-color: rgba(255, 255, 255, 0.7)')
  })

  it('removes Tailwind initial fallback variables that break gradient var fallbacks without @property', () => {
    const css = [
      '@property --tw-gradient-position { syntax: "*"; inherits: false; }',
      '@property --tw-gradient-stops { syntax: "*"; inherits: false; }',
      '@property --tw-gradient-via-stops { syntax: "*"; inherits: false; }',
      '@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) {',
      '  *, ::before, ::after, ::backdrop {',
      '    --tw-gradient-position: initial;',
      '    --tw-gradient-from: #0000;',
      '    --tw-gradient-via: #0000;',
      '    --tw-gradient-to: #0000;',
      '    --tw-gradient-stops: initial;',
      '    --tw-gradient-via-stops: initial;',
      '    --tw-gradient-from-position: 0%;',
      '    --tw-gradient-via-position: 50%;',
      '    --tw-gradient-to-position: 100%;',
      '  }',
      '}',
      '.bg-gradient-to-br {',
      '  --tw-gradient-position: to bottom right in oklab;',
      '  background-image: linear-gradient(var(--tw-gradient-stops));',
      '}',
      '.from-slate-900\\/95 {',
      '  --tw-gradient-from: rgba(15, 23, 43, 0.95);',
      '  --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));',
      '}',
      '.to-slate-700\\/95 {',
      '  --tw-gradient-to: rgba(49, 65, 88, 0.95);',
      '  --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));',
      '}',
    ].join('\n')
    const result = transformWebCssCompat(css, true)

    expect(result).not.toContain('@property')
    expect(result).not.toContain('--tw-gradient-position: initial')
    expect(result).not.toContain('--tw-gradient-stops: initial')
    expect(result).not.toContain('--tw-gradient-via-stops: initial')
    expect(result).toContain('--tw-gradient-from: #0000')
    expect(result).toContain('--tw-gradient-to: #0000')
    expect(result).toContain('--tw-gradient-position: to bottom right')
    expect(result).not.toContain('to bottom right in oklab')
    expect(result).toContain('background-image: linear-gradient(var(--tw-gradient-stops))')
    expect(result).toContain('var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from)')
  })

  it('normalizes Tailwind CSS v4 gradient interpolation hints for legacy WebView', () => {
    const css = [
      '.bg-linear {',
      '  --tw-gradient-position: in oklab;',
      '  background-image: linear-gradient(var(--tw-gradient-stops));',
      '}',
      '.bg-radial {',
      '  --tw-gradient-position: in oklab;',
      '  background-image: radial-gradient(var(--tw-gradient-stops));',
      '}',
      '.bg-conic {',
      '  --tw-gradient-position: in oklab;',
      '  background-image: conic-gradient(var(--tw-gradient-stops));',
      '}',
    ].join('\n')
    const result = transformWebCssCompat(css, true)

    expect(result).not.toContain('in oklab')
    expect(result).toContain('--tw-gradient-position: to bottom')
    expect(result).toContain('--tw-gradient-position: at center')
    expect(result).toContain('--tw-gradient-position: from 0deg')
  })

  it('normalizes Tailwind CSS v4 infinity radius for legacy WebView', () => {
    const css = [
      '.rounded-full {',
      '  border-radius: calc(infinity * 1px);',
      '}',
      '.rounded-t-full {',
      '  border-top-left-radius: calc(infinity * 1px);',
      '  border-top-right-radius: calc(infinity * 1px);',
      '}',
    ].join('\n')
    const result = transformWebCssCompat(css, true)

    expect(result).toContain('border-radius: 9999px')
    expect(result).toContain('border-top-left-radius: 9999px')
    expect(result).toContain('border-top-right-radius: 9999px')
    expect(result).not.toContain('infinity')
  })

  it('preserves Tailwind registered property initial values as web compat fallbacks', () => {
    const css = [
      '@property --tw-border-style { syntax: "*"; inherits: false; initial-value: solid; }',
      '@property --tw-shadow { syntax: "*"; inherits: false; initial-value: 0 0 #0000; }',
      '@property --tw-gradient-stops { syntax: "*"; inherits: false; }',
      '@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) {',
      '  *, ::before, ::after, ::backdrop {',
      '    --tw-border-style: solid;',
      '    --tw-shadow: 0 0 #0000;',
      '    --tw-gradient-stops: initial;',
      '  }',
      '}',
      '.border { border-style: var(--tw-border-style); border-width: 1px; }',
      '.shadow { box-shadow: var(--tw-shadow); }',
      '.bg-gradient { background-image: linear-gradient(var(--tw-gradient-stops)); }',
    ].join('\n')
    const result = transformWebCssCompat(css, true)

    expect(result).not.toContain('@property')
    expect(result).toContain('*, ::before, ::after, ::backdrop')
    expect(result).toContain('--tw-border-style: solid')
    expect(result).toContain('--tw-shadow: 0 0 #0000')
    expect(result).not.toContain('--tw-gradient-stops: initial')
    expect(result).toContain('border-style: var(--tw-border-style)')
    expect(result).toContain('box-shadow: var(--tw-shadow)')
  })

  it('removes known Tailwind initial fallback variables when dev css chunks no longer contain @property rules', () => {
    const css = [
      '@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) {',
      '  *, ::before, ::after, ::backdrop {',
      '    --tw-gradient-position: initial;',
      '    --tw-gradient-from: #0000;',
      '    --tw-gradient-via: #0000;',
      '    --tw-gradient-to: #0000;',
      '    --tw-gradient-stops: initial;',
      '    --tw-gradient-via-stops: initial;',
      '    --tw-leading: initial;',
      '    --tw-font-weight: initial;',
      '    --tw-tracking: initial;',
      '    --tw-shadow-color: initial;',
      '  }',
      '}',
      '.bg-gradient-to-br {',
      '  --tw-gradient-position: to bottom right in oklab;',
      '  background-image: linear-gradient(var(--tw-gradient-stops));',
      '}',
    ].join('\n')
    const result = transformWebCssCompat(css, true)

    expect(result).not.toContain('--tw-gradient-position: initial')
    expect(result).not.toContain('--tw-gradient-stops: initial')
    expect(result).not.toContain('--tw-gradient-via-stops: initial')
    expect(result).not.toContain('--tw-leading: initial')
    expect(result).not.toContain('--tw-font-weight: initial')
    expect(result).not.toContain('--tw-tracking: initial')
    expect(result).toContain('--tw-shadow-color: initial')
    expect(result).toContain('--tw-gradient-from: #0000')
    expect(result).toContain('--tw-gradient-position: to bottom right')
    expect(result).not.toContain('to bottom right in oklab')
    expect(result).toContain('background-image: linear-gradient(var(--tw-gradient-stops))')
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
    expect(keepSupports).toContain('color: rgb(')
    expect(keepSupports).not.toContain('color: oklch(')
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
    expect(result).toContain('color: rgb(')
    expect(result).not.toContain('color: oklch(')
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
