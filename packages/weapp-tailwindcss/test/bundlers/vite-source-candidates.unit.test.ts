import { afterEach, describe, expect, it, vi } from 'vitest'

describe('bundlers/vite source candidates', () => {
  afterEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('reuses extracted candidates for identical source content', async () => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const collector = createSourceCandidateCollector()
    const source = '<view class="text-[23px] bg-[#123456]"></view>'

    await collector.sync('/project/pages/index.wxml', source)
    await collector.sync('/project/sub/pages/index.wxml', source)

    expect(collector.values()).toEqual(new Set(['text-[23px]', 'bg-[#123456]']))
  })

  it('collects complex arbitrary source candidates with the lightweight HMR extractor', async () => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const collector = createSourceCandidateCollector()

    await collector.sync('/project/pages/index.wxml', [
      '<view class="w-[calc(100%_-_32px)] bg-[rgb(12,34,56)]">',
      '  <view class="group-[:nth-of-type(3)_&]:block [mask-type:luminance]"></view>',
      '</view>',
    ].join('\n'))

    const values = collector.values()
    expect(values.has('w-[calc(100%_-_32px)]')).toBe(true)
    expect(values.has('bg-[rgb(12,34,56)]')).toBe(true)
    expect(values.has('group-[:nth-of-type(3)_&]:block')).toBe(true)
    expect(values.has('[mask-type:luminance]')).toBe(true)
  })

  it('matches updated relative-path files against absolute @source entries', async () => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const collector = createSourceCandidateCollector()

    await collector.sync('src/pages/index.vue', '<view class="bg-[#000020] text-[23.000020px]"></view>')

    expect(collector.valuesForEntries([{
      base: process.cwd(),
      negated: false,
      pattern: 'src/**/*',
    }])).toEqual(new Set(['bg-[#000020]', 'text-[23.000020px]']))
  })
})
