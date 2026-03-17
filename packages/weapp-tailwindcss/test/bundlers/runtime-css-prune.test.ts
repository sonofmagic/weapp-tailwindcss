import { describe, expect, it } from 'vitest'
import { MappingChars2String } from '@weapp-core/escape'
import { pruneStaleRuntimeCss } from '@/bundlers/webpack/BaseUnifiedPlugin/runtime-css-prune'
import { replaceWxml } from '@/wxml'

describe('bundlers/runtime css prune', () => {
  it('removes escaped runtime rules that are no longer present in the runtime set', () => {
    const active = 'text-[20px]'
    const stale = 'text-[23.000497px]'
    const css = [
      `.${replaceWxml(active, { escapeMap: MappingChars2String })} { color: red; }`,
      `.${replaceWxml(stale, { escapeMap: MappingChars2String })} { color: blue; }`,
      '.custom-card { color: green; }',
    ].join('\n')

    const pruned = pruneStaleRuntimeCss(css, new Set([active]), {
      escapeMap: MappingChars2String,
    }, new Set(['custom-card']))

    expect(pruned).toContain(replaceWxml(active, { escapeMap: MappingChars2String }))
    expect(pruned).not.toContain(replaceWxml(stale, { escapeMap: MappingChars2String }))
    expect(pruned).toContain('.custom-card')
  })

  it('removes stale runtime rules that start with a complex selector', () => {
    const active = 'space-y-1.5'
    const stale = 'space-y-2.5'
    const css = [
      `.${replaceWxml(active, { escapeMap: MappingChars2String })}>view+view { margin-top: 12rpx; }`,
      `.${replaceWxml(stale, { escapeMap: MappingChars2String })}>view+view { margin-top: 20rpx; }`,
    ].join('\n')

    const pruned = pruneStaleRuntimeCss(css, new Set([active]), {
      escapeMap: MappingChars2String,
    })

    expect(pruned).toContain(replaceWxml(active, { escapeMap: MappingChars2String }))
    expect(pruned).not.toContain(replaceWxml(stale, { escapeMap: MappingChars2String }))
  })

  it('preserves authored complex selectors discovered from css entries', () => {
    const stale = 'space-y-2.5'
    const escapedStale = replaceWxml(stale, { escapeMap: MappingChars2String })
    const css = `.${escapedStale}>view+view { margin-top: 20rpx; }`

    const pruned = pruneStaleRuntimeCss(css, new Set(['space-y-1.5']), {
      escapeMap: MappingChars2String,
    }, new Set([escapedStale]))

    expect(pruned).toContain(escapedStale)
  })

  it('removes stale runtime classes that appear later in a complex selector', () => {
    const active = 'group-[:nth-of-type(3)_&]:block'
    const stale = 'supports-[display:grid]:grid'
    const escapedActive = replaceWxml(active, { escapeMap: MappingChars2String })
    const escapedStale = replaceWxml(stale, { escapeMap: MappingChars2String })
    const css = [
      `:nth-of-type(3) :where(.group) view.${escapedActive} { display: block; }`,
      `@supports (display:grid) { view.${escapedStale} { display: grid; } }`,
    ].join('\n')

    const pruned = pruneStaleRuntimeCss(css, new Set([active]), {
      escapeMap: MappingChars2String,
    })

    expect(pruned).toContain(escapedActive)
    expect(pruned).not.toContain(escapedStale)
  })

  it('preserves root helper class selectors such as .tw-root', () => {
    const css = 'page,.tw-root,wx-root-portal-content,:host{--x:1}._b_hstale_B{color:blue}'

    const pruned = pruneStaleRuntimeCss(css, new Set(['bg-red-500']), {
      escapeMap: MappingChars2String,
    }, new Set(['tw-root']))

    expect(pruned).toContain('.tw-root')
    expect(pruned).toContain('wx-root-portal-content')
    expect(pruned).not.toContain('._b_hstale_B')
  })

  it('does not prune ordinary authored hyphenated class names that are outside the escaped runtime namespace', () => {
    const css = '.foo-bar{color:red}.layout-main{display:flex}._b_hstale_B{color:blue}'

    const pruned = pruneStaleRuntimeCss(css, new Set(['bg-red-500']), {
      escapeMap: MappingChars2String,
    })

    expect(pruned).toContain('.foo-bar')
    expect(pruned).toContain('.layout-main')
    expect(pruned).not.toContain('._b_hstale_B')
  })
})
