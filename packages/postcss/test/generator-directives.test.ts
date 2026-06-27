import { analyzeTailwindCssDirectives, postcss } from '@/index'

describe('tailwind css directive analysis', () => {
  it('collects Tailwind generation directive signals from one PostCSS root', () => {
    const css = [
      '@import "./local.css";',
      '@import "weapp-tailwindcss";',
      '@plugin "@iconify/tailwind4" {',
      '  prefix: "i";',
      '}',
      '@custom-variant any-hover {',
      '  @media (any-hover: hover) {',
      '    &:hover { @slot; }',
      '  }',
      '}',
      '.btn { @apply flex text-sm; }',
    ].join('\n')

    expect(analyzeTailwindCssDirectives(postcss.parse(css), { importFallback: true })).toEqual({
      hasLocalCssImport: true,
      hasTailwindApplyDirective: true,
      hasTailwindNonRootGenerationDirectives: true,
      hasTailwindRootDirectives: true,
      hasTailwindRootImportDirectives: true,
      hasTailwindSourceDirectives: true,
    })
  })

  it('can ignore generated layer blocks while keeping real root directives', () => {
    const css = [
      '@layer theme, base, components, utilities;',
      '@layer theme {',
      '  :host,page { --color-slate-900: #0f172a; }',
      '}',
      '.flex { display: flex; }',
    ].join('\n')

    expect(analyzeTailwindCssDirectives(postcss.parse(css), { ignoreLayer: true })).toMatchObject({
      hasTailwindNonRootGenerationDirectives: false,
      hasTailwindSourceDirectives: false,
    })
  })
})
