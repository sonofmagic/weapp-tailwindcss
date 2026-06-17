import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  collectCssInlineSourceCandidates,
  expandTailwindSourceEntries,
  isFileMatchedByTailwindSourceEntries,
  resolveCssSourceEntries,
  resolveSourceScanPath,
  resolveTailwindSourceEntry,
} from '@/tailwindcss/source-scan'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import postcss from 'postcss'

describe('tailwindcss source scan', () => {
  it('moves static relative glob prefixes into the scan base', async () => {
    const entry = await resolveTailwindSourceEntry(
      '../src/**/*.{vue,js,ts}',
      '/project/src',
      false,
    )

    expect(entry).toEqual({
      base: path.resolve('/project/src/../src'),
      negated: false,
      pattern: '**/*.{vue,js,ts}',
    })
  })

  it('keeps negated static relative glob prefixes matchable', async () => {
    const entry = await resolveTailwindSourceEntry(
      '../src/uni_modules/**/*',
      '/project/src',
      true,
    )

    expect(entry).toEqual({
      base: path.resolve('/project/src/../src/uni_modules'),
      negated: true,
      pattern: '**/*',
    })
  })

  it('matches Tailwind v4 source entries while honoring negated generated ts globs', async () => {
    const root = path.resolve('/project')
    const entries = await resolveCssSourceEntries(postcss.parse([
      '@import "tailwindcss" source(none);',
      '@source "./src/**/*.{ts,wxml}";',
      '@source not "./src/generated/**/*.ts";',
    ].join('\n')), root, '**/*')

    expect(isFileMatchedByTailwindSourceEntries(path.join(root, 'src/pages/index.ts'), entries)).toBe(true)
    expect(isFileMatchedByTailwindSourceEntries(path.join(root, 'src/generated/openapi-client.ts'), entries)).toBe(false)
  })

  it('keeps empty brace parts for Tailwind v4 inline source variants', () => {
    const inlineCandidates = collectCssInlineSourceCandidates(postcss.parse([
      '@source inline("{hover:,focus:,}underline p-{2..6..2}");',
      '@source not inline("p-4");',
    ].join('\n')))

    expect(inlineCandidates.included).toEqual(new Set([
      'hover:underline',
      'focus:underline',
      'underline',
      'p-2',
      'p-6',
    ]))
    expect(inlineCandidates.excluded).toEqual(new Set(['p-4']))
  })

  it('keeps files resolved by grouped positive entries when applying final excludes', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'weapp-tw-source-scan-'))
    await mkdir(path.join(cwd, 'src'), { recursive: true })
    await writeFile(path.join(cwd, 'src/index.wxml'), '<view class="text-white"></view>')

    const files = await expandTailwindSourceEntries([{
      base: path.join(cwd, 'src'),
      negated: false,
      pattern: '**/*.wxml',
    }])

    expect(files).toEqual([resolveSourceScanPath(path.join(cwd, 'src/index.wxml'))])
  })

  it('removes files matching negated entries after grouped source expansion', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'weapp-tw-source-scan-'))
    await mkdir(path.join(cwd, 'src/ignored'), { recursive: true })
    await writeFile(path.join(cwd, 'src/index.wxml'), '<view class="text-white"></view>')
    await writeFile(path.join(cwd, 'src/ignored/index.wxml'), '<view class="text-red-500"></view>')

    const files = await expandTailwindSourceEntries([
      {
        base: path.join(cwd, 'src'),
        negated: false,
        pattern: '**/*.wxml',
      },
      {
        base: path.join(cwd, 'src'),
        negated: true,
        pattern: 'ignored/**',
      },
    ])

    expect(files).toEqual([resolveSourceScanPath(path.join(cwd, 'src/index.wxml'))])
  })
})
