import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import { build as viteBuild } from 'vite'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadTailwindcss3 } from '../scripts/load-tailwindcss3'
import { weappTailwindcssUIPreset } from '../src/preset'
import { button, mergeClassNames, skeleton, tag } from '../src/variants'

const testDir = fileURLToPath(new URL('.', import.meta.url))
const packageRoot = resolve(testDir, '..')
const distCss = resolve(packageRoot, 'dist/index.css')
const viteConfigPath = resolve(packageRoot, 'vite.config.ts')

let cssOutput = ''
let cssOutputV3 = ''

beforeAll(async () => {
  await viteBuild({
    configFile: viteConfigPath,
    mode: 'test',
    logLevel: 'error',
  })
  cssOutput = await readFile(distCss, 'utf8')

  const tailwindcss3 = await loadTailwindcss3(packageRoot)
  const result = await postcss([
    tailwindcss3({
      presets: [weappTailwindcssUIPreset],
      corePlugins: { preflight: false },
      content: [{ raw: '', extension: 'html' }],
    }),
  ]).process('@tailwind base; @tailwind components; @tailwind utilities;', { from: undefined })

  cssOutputV3 = result.css
})

describe('atomic CSS build', () => {
  it('contains design tokens', () => {
    expect(cssOutput).toContain('--wt-color-primary')
    expect(cssOutput).toContain('--wt-space-4')
    expect(cssOutput).toContain('--wt-radius-lg')
  })

  it('exposes core utilities', () => {
    expect(cssOutput).toContain('.wt-flex')
    expect(cssOutput).toContain('.wt-gap-2')
    expect(cssOutput).toContain('.wt-px-4')
  })

  it('exposes component recipes', () => {
    expect(cssOutput).toContain('.wt-button')
    expect(cssOutput).toContain('.wt-card__header')
    expect(cssOutput).toContain('.wt-toast')
  })

  it('ships advanced states and animations', () => {
    expect(cssOutput).toContain('.wt-button:active')
    expect(cssOutput).toContain('.wt-input.is-error')
    expect(cssOutput).toContain('@keyframes wt-skeleton-pulse')
  })
})

describe('tailwind v3 compatibility', () => {
  it('emits utilities and components', () => {
    expect(cssOutputV3).toContain('.wt-flex')
    expect(cssOutputV3).toContain('.wt-button')
    expect(cssOutputV3).toContain('@keyframes wt-skeleton-pulse')
  })
})

describe('variants utilities', () => {
  it('merges conflicting spacing classes', () => {
    expect(mergeClassNames('px-4', 'px-6')).toBe('px-6')
  })

  it('composes button variants with @weapp-tailwindcss/merge', () => {
    const classes = button({ tone: 'secondary', appearance: 'outline', class: 'px-4 px-6' })
    expect(classes.split(' ')).toContain('wt-button')
    expect(classes.split(' ')).toContain('wt-button--secondary')
    expect(classes.split(' ')).toContain('wt-button--outline')
    expect(classes).not.toMatch(/px-4/) // merged away
    expect(classes).toContain('px-6')
  })

  it('supports tag variants', () => {
    expect(tag({ tone: 'danger' })).toContain('wt-tag--danger')
    expect(tag({ tone: 'ghost' })).toContain('wt-tag--ghost')
  })

  it('supports skeleton tones', () => {
    expect(skeleton()).toBe('wt-skeleton')
    expect(skeleton({ tone: 'dark' })).toContain('wt-skeleton--dark')
  })
})
