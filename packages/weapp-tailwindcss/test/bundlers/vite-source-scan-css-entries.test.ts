import path from 'node:path'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import {
  collectConfiguredCssSources,
  collectExistingCssEntries,
  discoverTailwindV4CssEntries,
  mergeTailwindInlineSourceCandidates,
  resolveTailwindConfigEntriesFromCssCached,
  resolveTailwindV4EntriesFromCss,
  resolveTailwindV4EntriesFromCssCached,
  resolveViteTailwindV4CssDependencies,
} from '@/bundlers/vite/source-scan/css-entries'

describe('vite source scan css entries', () => {
  it('merges inline candidates with excludes taking precedence', () => {
    const merged = mergeTailwindInlineSourceCandidates([
      { included: new Set(['flex', 'grid']), excluded: new Set(['hidden']) },
      { included: new Set(['hidden', 'block']), excluded: new Set(['grid']) },
      undefined,
    ])

    expect(merged?.included).toEqual(new Set(['flex', 'block']))
    expect(merged?.excluded).toEqual(new Set(['hidden', 'grid']))
    expect(mergeTailwindInlineSourceCandidates([])).toBeUndefined()
  })

  it('resolves Tailwind v4 entries from import source params and inline candidates', async () => {
    const base = process.cwd()
    const fromSource = await resolveTailwindV4EntriesFromCss('@import "tailwindcss" source("./src");', base)
    const sourceNone = await resolveTailwindV4EntriesFromCss('@import url("tailwindcss") source(none);', base)
    const inline = await resolveTailwindV4EntriesFromCss('@source inline("flex");\n@source not inline("hidden");', base)
    const invalid = await resolveTailwindV4EntriesFromCss('@import "tailwindcss"', base)

    expect(fromSource?.explicit).toBe(true)
    expect(fromSource?.entries[0]).toMatchObject({
      base: path.resolve(base, 'src'),
      negated: false,
    })
    expect(sourceNone?.explicit).toBe(true)
    expect(inline?.entries).toEqual([])
    expect(inline?.inlineCandidates.included).toEqual(new Set(['flex']))
    expect(inline?.inlineCandidates.excluded).toEqual(new Set(['hidden']))
    expect(invalid?.explicit).toBe(false)
    await expect(resolveTailwindV4EntriesFromCss('{', base)).resolves.toBeUndefined()
  })

  it('collects config dependencies and caches css entry resolution', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-css-entries-'))
    const config = path.join(root, 'tailwind.config.js')
    await writeFile(config, 'module.exports = { content: ["./pages/**/*.wxml"] }')
    const css = '@config "./tailwind.config.js";\n@import "tailwindcss";'

    const first = await resolveTailwindV4EntriesFromCssCached(css, root)
    const second = await resolveTailwindV4EntriesFromCssCached(css, root)
    const configOnly = await resolveTailwindConfigEntriesFromCssCached(css, root)

    expect(second).toBe(first)
    expect(first?.dependencies).toEqual([config])
    expect(configOnly?.explicit).toBe(true)
    expect(configOnly?.dependencies).toEqual([config])
    expect(configOnly?.entries.some(entry => entry.negated && entry.pattern === 'tailwind.config.js')).toBe(true)
    await expect(resolveTailwindConfigEntriesFromCssCached('@import "tailwindcss";', root)).resolves.toBeUndefined()
    await expect(resolveViteTailwindV4CssDependencies(css, root)).resolves.toEqual([config])
  })

  it('collects configured and existing css entries and discovers project css entries', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-discover-css-'))
    await mkdir(path.join(root, 'src'), { recursive: true })
    await mkdir(path.join(root, 'dist'), { recursive: true })
    const appCss = path.join(root, 'src/app.css')
    const otherCss = path.join(root, 'src/other.css')
    const distCss = path.join(root, 'dist/app.css')
    await writeFile(appCss, '@import "tailwindcss";')
    await writeFile(otherCss, '.plain{color:red}')
    await writeFile(distCss, '@import "tailwindcss";')

    expect(collectExistingCssEntries({
      cssEntries: [appCss, otherCss, path.join(root, 'missing.css')],
      tailwindcss: { v4: { cssEntries: [appCss] } },
    } as any)).toEqual([appCss, otherCss, appCss])
    expect(collectConfiguredCssSources({
      tailwindcss: { v4: { cssSources: [{ file: appCss, css: '@import "tailwindcss";', base: root }] } },
      tailwindcssRuntimeOptions: { tailwindcss: { v4: { cssSources: [{ file: otherCss, css: '.runtime{}', base: root }] } } },
    } as any)).toHaveLength(2)

    await expect(discoverTailwindV4CssEntries(root, 'dist')).resolves.toEqual([appCss])
  })
})
