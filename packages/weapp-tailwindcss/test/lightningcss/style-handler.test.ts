import { describe, expect, it } from 'vitest'
import { createLightningcssStyleHandler } from '@/lightningcss'

describe('lightningcss style handler', () => {
  it('escapes class selectors and removes hover rules', async () => {
    const handler = createLightningcssStyleHandler()
    const { code } = await handler(`
      :root { color: red; }
      .sm\\:text-red-500:hover { color: blue; }
      .space-x-2>:not([hidden])~:not([hidden]) { margin-left: 16px; }
      * { box-sizing: border-box; }
      @property --test { syntax: "<number>"; inherits: false; initial-value: 0; }
    `)

    expect(code).toContain('page')
    expect(code).not.toContain(':hover')
    expect(code).toContain(':is(view, text)')
    expect(code).not.toContain('@property')
    expect(code).not.toContain('smctext-red-500')
  })

  it('respects custom cssChildCombinatorReplaceValue', async () => {
    const handler = createLightningcssStyleHandler({
      cssChildCombinatorReplaceValue: 'view',
    })

    const { code } = await handler(`
      .divide-y>:not([hidden])~:not([hidden]) { border-top-width:1px; }
    `)

    expect(code).toContain('view + view')
  })
})
