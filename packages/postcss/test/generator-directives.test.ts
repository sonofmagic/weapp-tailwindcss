import {
  analyzeTailwindCssDirectives,
  isTailwindCssGenerationDirective,
  isTailwindCssImportAtRule,
  isTailwindCssImportRequest,
  isTailwindCssPackageJsonImportRequest,
  isWeappTailwindcssImportRequest,
  normalizeTailwindCssImportRequest,
  parseTailwindCssConfigRequest,
  parseTailwindCssDirectiveRequest,
  postcss,
} from '@/index'
import { hasTailwindRootDirectives } from '@/generator-plugin/directives'

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

  it('covers directive request parser and import fallbacks', () => {
    expect(parseTailwindCssDirectiveRequest('url("tailwindcss") layer(theme)')).toBe('tailwindcss')
    expect(parseTailwindCssDirectiveRequest('url(tailwindcss/utilities)')).toBe('tailwindcss/utilities')
    expect(parseTailwindCssDirectiveRequest('')).toBeUndefined()
    expect(parseTailwindCssConfigRequest('"./tailwind.config.ts";')).toBe('./tailwind.config.ts')
    expect(parseTailwindCssConfigRequest('./tailwind.config.ts')).toBeUndefined()

    expect(isTailwindCssPackageJsonImportRequest('#tailwindcss')).toBe(true)
    expect(isTailwindCssPackageJsonImportRequest(undefined)).toBe(false)
    expect(isWeappTailwindcssImportRequest('weapp-tailwindcss/vite')).toBe(true)
    expect(isWeappTailwindcssImportRequest(undefined)).toBe(false)
    expect(normalizeTailwindCssImportRequest('weapp-tailwindcss/theme', { importFallback: true })).toBe('tailwindcss/theme')
    expect(isTailwindCssImportRequest('tailwindcss4/utilities')).toBe(true)
    expect(isTailwindCssImportRequest('weapp-tailwindcss', { importFallback: true })).toBe(true)
  })

  it('detects tailwind import and generation directives across at-rule forms', () => {
    const root = postcss.parse([
      '@tailwind utilities;',
      '@use "tailwindcss";',
      '@forward "tailwindcss/theme";',
      '@config "#package-config";',
      '.btn { color: red; }',
    ].join('\n'))
    const rules = root.nodes.filter((node): node is postcss.AtRule => node.type === 'atrule')

    expect(isTailwindCssImportAtRule(rules[0])).toBe(true)
    expect(isTailwindCssImportAtRule(rules[1])).toBe(true)
    expect(isTailwindCssImportAtRule(rules[2])).toBe(true)
    expect(isTailwindCssGenerationDirective(root.nodes[root.nodes.length - 1])).toBe(false)
    expect(analyzeTailwindCssDirectives(root)).toMatchObject({
      hasTailwindRootDirectives: true,
      hasTailwindRootImportDirectives: true,
      hasTailwindSourceDirectives: true,
    })
    expect(hasTailwindRootDirectives(postcss.parse('.btn{color:red}'))).toBe(false)
    expect(hasTailwindRootDirectives(postcss.parse('@import "weapp-tailwindcss";'), { importFallback: true })).toBe(true)
  })
})
