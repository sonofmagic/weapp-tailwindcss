import { templateHandler } from '#test/v2/wxml'
import { MappingChars2String } from '@weapp-core/escape'

function simpleHandler(str: string) {
  return templateHandler(str, {
    escapeMap: MappingChars2String,
  })
}

describe('arbitrary variants', () => {
  it('[&:nth-child(3)]:underline', () => {
    const res = simpleHandler('<li class="[&:nth-child(3)]:underline">{item}</li>')
    expect(res).toMatchSnapshot()
  })

  it('lg:[&:nth-child(3)]:hover:underline', () => {
    const res = simpleHandler('<li class="lg:[&:nth-child(3)]:hover:underline">{item}</li>')
    expect(res).toMatchSnapshot()
  })

  it('[&_p]:mt-4', () => {
    const res = simpleHandler('<div class="[&_p]:mt-4"></div>')
    expect(res).toMatchSnapshot()
  })

  it('[@supports(display:grid)]:grid', () => {
    const res = simpleHandler('<div class="flex [@supports(display:grid)]:grid"></div>')
    expect(res).toMatchSnapshot()
  })

  it('[@media(any-hover:hover){&:hover}]:opacity-100', () => {
    const res = simpleHandler('<button type="button" class="[@media(any-hover:hover){&:hover}]:opacity-100"></button>')
    expect(res).toMatchSnapshot()
  })

  it('[&_.u-count-down__text]:!text-red-400', () => {
    const res = simpleHandler('<view class="after:border-none after:content-[\'Hello_World\']">after:border-none</view>')
    expect(res).toMatchSnapshot()
  })
})

describe('simpleHandler', () => {
  it('[&:nth-child(3)]:underline', () => {
    const res = simpleHandler('<li class="[&:nth-child(3)]:underline">{item}</li>')
    expect(res).toMatchSnapshot()
  })

  it('lg:[&:nth-child(3)]:hover:underline', () => {
    const res = simpleHandler('<li class="lg:[&:nth-child(3)]:hover:underline">{item}</li>')
    expect(res).toMatchSnapshot()
  })

  it('[&_p]:mt-4', () => {
    const res = simpleHandler('<div class="[&_p]:mt-4"></div>')
    expect(res).toBe('<div class="_b_n_p_B_cmt-4"></div>')
  })

  it('[@supports(display:grid)]:grid', () => {
    const res = simpleHandler('<div class="flex [@supports(display:grid)]:grid"></div>')
    expect(res).toMatchSnapshot()
  })

  it('[@media(any-hover:hover){&:hover}]:opacity-100', () => {
    const res = simpleHandler('<button type="button" class="[@media(any-hover:hover){&:hover}]:opacity-100"></button>')
    expect(res).toMatchSnapshot()
  })

  it('[&_.u-count-down__text]:!text-red-400', () => {
    const res = simpleHandler('<view class="after:border-none after:content-[\'Hello_World\']">after:border-none</view>')
    expect(res).toBe('<view class="after_cborder-none after_ccontent-_b_aHello_World_a_B">after:border-none</view>')
  })
})
