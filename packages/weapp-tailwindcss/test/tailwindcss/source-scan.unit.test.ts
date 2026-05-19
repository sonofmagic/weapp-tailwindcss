import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveTailwindSourceEntry } from '@/tailwindcss/source-scan'

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
})
