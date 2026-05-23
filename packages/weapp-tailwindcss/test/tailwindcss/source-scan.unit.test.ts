import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  collectCssInlineSourceCandidates,
  resolveTailwindSourceEntry,
} from '@/tailwindcss/source-scan'
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
})
