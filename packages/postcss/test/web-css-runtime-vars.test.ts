import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import postcss from 'postcss'
import { describe, expect, it } from 'vitest'
import { transformWebCssCompat } from '../src/compat/web-css'

const require = createRequire(import.meta.url)

const runtimeVariableFamilies = {
  transform: /^--tw-(?:border-spacing-[xy]|rotate(?:-[xyz])?|rotate-|scale(?:-[xyz])?|scale-|skew-[xy]|translate(?:-[xyz])?|translate-)$/,
  spacingAndInteraction: /^--tw-(?:border-style|divide-[xy]-reverse|outline-style|pan-[xy]|pinch-zoom|scroll-snap-strictness|scrollbar-(?:thumb|track)|space-[xy]-reverse)$/,
  gradient: /^--tw-gradient-/,
  mask: /^--tw-mask-/,
  filter: /^--tw-(?:backdrop-(?:blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia)|blur|brightness|contrast|drop-shadow(?:-(?:alpha|color|size))?|grayscale|hue-rotate|invert|opacity|saturate|sepia)$/,
  shadowAndRing: /^--tw-(?:inset-ring(?:-(?:color|shadow))?|inset-shadow(?:-(?:alpha|color))?|ring(?:-(?:color|inset|offset-color|offset-shadow|offset-width|shadow))?|shadow(?:-(?:alpha|color))?|text-shadow-(?:alpha|color))$/,
  transition: /^--tw-(?:duration|ease)$/,
  typographyAndContent: /^--tw-(?:content|font-weight|leading|numeric-(?:figure|fraction|spacing)|ordinal|slashed-zero|tracking)$/,
  containAndInternal: /^--tw-(?:contain-(?:layout|paint|size|style)|container-component|sort|variant-check)$/,
} as const

const colorCompositionProperties = [
  '--tw-shadow-color',
  '--tw-inset-shadow-color',
  '--tw-text-shadow-color',
  '--tw-drop-shadow-color',
  '--tw-ring-color',
  '--tw-inset-ring-color',
  '--tw-ring-offset-color',
  '--tw-gradient-from',
  '--tw-gradient-via',
  '--tw-gradient-to',
  '--tw-mask-linear-from-color',
  '--tw-mask-linear-to-color',
  '--tw-mask-radial-from-color',
  '--tw-mask-radial-to-color',
  '--tw-mask-conic-from-color',
  '--tw-mask-conic-to-color',
  ...['top', 'right', 'bottom', 'left'].flatMap(edge => [
    `--tw-mask-${edge}-from-color`,
    `--tw-mask-${edge}-to-color`,
  ]),
]

function readTailwindV4Bundle() {
  const packageRoot = path.dirname(require.resolve('tailwindcss/package.json'))
  for (const filepath of [
    path.join(packageRoot, 'dist/chunk-3IR7ZFJX.mjs'),
    path.join(packageRoot, 'dist/lib.js'),
  ]) {
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath, 'utf8')
    }
  }
  throw new Error(`missing Tailwind CSS v4 bundle in ${packageRoot}`)
}

function extractTailwindRuntimeVariables(source: string) {
  return new Set(Array.from(source.matchAll(/--tw-[a-z0-9-]+/g), match => match[0])
    .filter(property => !property.endsWith('-')))
}

function findDeclaration(root: postcss.Root, selector: string, prop: string) {
  let value: string | undefined
  root.walkRules(selector, (rule) => {
    rule.walkDecls(prop, (decl) => {
      value = decl.value
    })
  })
  return value
}

describe('web css Tailwind runtime variable coverage', () => {
  const officialRuntimeVariables = extractTailwindRuntimeVariables(readTailwindV4Bundle())

  it('classifies every Tailwind CSS v4 runtime variable from the installed bundle', () => {
    expect(officialRuntimeVariables.size).toBeGreaterThanOrEqual(130)
    for (const property of [
      '--tw-gradient-stops',
      '--tw-mask-linear-stops',
      '--tw-drop-shadow-color',
      '--tw-text-shadow-color',
      '--tw-inset-shadow-color',
      '--tw-ring-offset-color',
    ]) {
      expect(officialRuntimeVariables, `${property} should exist in the installed Tailwind bundle`).toContain(property)
    }

    const unclassified: string[] = []
    const multiplyClassified: string[] = []
    for (const property of officialRuntimeVariables) {
      const families = Object.entries(runtimeVariableFamilies)
        .filter(([, pattern]) => pattern.test(property))
        .map(([family]) => family)
      if (families.length === 0) {
        unclassified.push(property)
      }
      else if (families.length > 1) {
        multiplyClassified.push(`${property}: ${families.join(', ')}`)
      }
    }

    expect(unclassified).toEqual([])
    expect(multiplyClassified).toEqual([])
  })

  it('normalizes root runtime variable declarations without inlining any runtime variable reference', () => {
    const declarations = [...officialRuntimeVariables]
      .map(property => `${property}: oklch(63.7% 0.237 25.331);`)
      .join('')
    const consumers = [...officialRuntimeVariables]
      .map((property, index) => `--runtime-probe-${index}: var(${property});`)
      .join('')
    const result = transformWebCssCompat(`:root, :host { ${declarations} } .consumer { ${consumers} }`, true)
    const root = postcss.parse(result)

    expect(result).not.toContain('oklch(')
    for (const [index, property] of [...officialRuntimeVariables].entries()) {
      expect(findDeclaration(root, ':root, :host', property), `${property} declaration`).toMatch(/^rgb\(/)
      expect(findDeclaration(root, '.consumer', `--runtime-probe-${index}`), `${property} consumer`).toBe(`var(${property})`)
    }
  })

  it.each([false, true])('keeps every color composition producer independent with reversed order=%s', (reversed) => {
    for (const property of colorCompositionProperties) {
      const producers = [
        `.runtime-red { ${property}: var(--color-red-500); }`,
        `@media (min-width: 1px) { .runtime-teal:hover { ${property}: color-mix(in oklab, var(--color-teal-600) 20%, transparent); } }`,
        `.runtime-arbitrary::before { ${property}: color(display-p3 0.2 0.4 0.6 / 0.35); }`,
      ]
      if (reversed) {
        producers.reverse()
      }
      const css = [
        ':root, :host { --color-red-500: oklch(63.7% 0.237 25.331); --color-teal-600: oklch(60% 0.118 184.704); }',
        `.runtime-consumer { --runtime-value: var(${property}); }`,
        ...producers,
      ].join('\n')
      const result = transformWebCssCompat(css, true)
      const root = postcss.parse(result)

      expect(findDeclaration(root, '.runtime-consumer', '--runtime-value'), `${property} consumer`).toBe(`var(${property})`)
      expect(findDeclaration(root, '.runtime-red', property), `${property} named color`).toBe('rgb(251, 44, 54)')
      expect(findDeclaration(root, '.runtime-teal:hover', property), `${property} opacity color`).toBe('rgba(0, 148, 136, 0.2)')
      expect(findDeclaration(root, '.runtime-arbitrary::before', property), `${property} arbitrary color`).toMatch(/^rgba?\(/)
    }
  })

  it('preserves runtime references across variants, nested rules, and selector shapes', () => {
    const css = [
      ':root, :host { --tw-shadow-color: oklch(63.7% 0.237 25.331); }',
      '.dark .dark\\:shadow-red-500 { --runtime-dark: var(--tw-shadow-color); }',
      '@media (min-width: 640px) { .sm\\:shadow-red-500:hover { --runtime-responsive: var(--tw-shadow-color); } }',
      '.before\\:shadow-red-500::before { --runtime-pseudo: var(--tw-shadow-color); }',
      '.nested { &:focus { --runtime-nested: var(--tw-shadow-color); } }',
    ].join('\n')
    const result = transformWebCssCompat(css, true)

    expect(result).toContain('--runtime-dark: var(--tw-shadow-color)')
    expect(result).toContain('--runtime-responsive: var(--tw-shadow-color)')
    expect(result).toContain('--runtime-pseudo: var(--tw-shadow-color)')
    expect(result).toContain('--runtime-nested: var(--tw-shadow-color)')
    expect(result).not.toContain('--runtime-dark: rgb(')
  })

  it('continues resolving root Tailwind theme colors for legacy web output', () => {
    const result = transformWebCssCompat([
      ':root, :host { --color-brand: oklch(63.7% 0.237 25.331); }',
      '.text-brand { color: var(--color-brand); }',
    ].join('\n'), true)

    expect(result).not.toContain('oklch(')
    expect(result).toContain('.text-brand { color: rgb(251, 44, 54); }')
  })
})
