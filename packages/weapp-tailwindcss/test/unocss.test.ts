import { getCompilerContext } from '@/context'

describe('unocss compatibility', () => {
  it('keeps UnoCSS compatibility disabled by default', () => {
    const ctx = getCompilerContext()

    expect(ctx.unocss).toBe(false)
    expect(ctx.arbitraryValues.bareArbitraryValues).toBe(false)
    expect(ctx.escapeMap[':']).toBe('_c')
  })

  it('enables UnoCSS bare arbitrary values and keeps existing class escaping', async () => {
    const { templateHandler, styleHandler, jsHandler, escapeMap, arbitraryValues } = getCompilerContext({
      unocss: true,
    })

    expect(arbitraryValues.bareArbitraryValues).toBe(true)
    expect(escapeMap[':']).toBe('_c')
    expect(escapeMap['[']).toBe('_b')
    expect(escapeMap['#']).toBe('_h')

    const template = await templateHandler('<view class="hover:!p-2.5 w-[10%] bg-[#fff]"></view>')
    expect(template).toBe('<view class="hover_c_ep-2_d5 w-_b10_v_B bg-_b_hfff_B"></view>')

    const { css } = await styleHandler('.hover\\:bg-\\[\\#fff\\].w-\\[10\\%\\]{color:red}', {
      isMainChunk: true,
    })
    expect(css).toBe('.hover_cbg-_b_hfff_B.w-_b10_v_B{color:red}')

    const { code } = jsHandler('const cls = "hover:!p-2.5 w-[10%] bg-[#fff]"', new Set([
      'hover:!p-2.5',
      'w-[10%]',
      'bg-[#fff]',
    ]))
    expect(code).toBe('const cls = "hover_c_ep-2_d5 w-_b10_v_B bg-_b_hfff_B"')
  })

  it('allows explicit bare arbitrary options', () => {
    const ctx = getCompilerContext({
      unocss: {
        bareArbitraryValues: {
          units: ['px'],
        },
      },
    })

    expect(ctx.arbitraryValues.bareArbitraryValues).toEqual({
      units: ['px'],
    })
    expect(ctx.escapeMap[':']).toBe('_c')
    expect(ctx.escapeMap['[']).toBe('_b')
  })

  it('keeps class escaping controlled by customReplaceDictionary', () => {
    const ctx = getCompilerContext({
      unocss: true,
      customReplaceDictionary: {
        ':': '__colon__',
      },
    })

    expect(ctx.escapeMap[':']).toBe('__colon__')
    expect(ctx.escapeMap['[']).toBe('_b')
  })

  it('fills bare arbitrary values when user arbitraryValues omits the field', () => {
    const ctx = getCompilerContext({
      arbitraryValues: {
        allowDoubleQuotes: true,
      },
      unocss: true,
    })

    expect(ctx.arbitraryValues.allowDoubleQuotes).toBe(true)
    expect(ctx.arbitraryValues.bareArbitraryValues).toBe(true)
  })
})
