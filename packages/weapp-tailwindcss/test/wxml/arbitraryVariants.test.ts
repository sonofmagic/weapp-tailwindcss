import { templateHandler } from '#test/v2/wxml'
import { MappingChars2String, SimpleMappingChars2String } from '@weapp-core/escape'

// https://tailwindcss.com/docs/hover-focus-and-other-states#using-arbitrary-variants
function complexHandler(str: string) {
  return templateHandler(str, {
    escapeMap: MappingChars2String,
  })
}

function simpleHandler(str: string) {
  return templateHandler(str, {
    escapeMap: SimpleMappingChars2String,
  })
}

describe('arbitrary variants', () => {
  it('[&:nth-child(3)]:underline', () => {
    const res = complexHandler('<li class="[&:nth-child(3)]:underline">{item}</li>')
    expect(res).toBe('<li class="_bl__am__c_nth-child_pl_3_qr__br__c_underline">{item}</li>')
  })

  it('lg:[&:nth-child(3)]:hover:underline', () => {
    const res = complexHandler('<li class="lg:[&:nth-child(3)]:hover:underline">{item}</li>')
    expect(res).toBe('<li class="lg_c__bl__am__c_nth-child_pl_3_qr__br__c_hover_c_underline">{item}</li>')
  })

  it('[&_p]:mt-4', () => {
    const res = complexHandler('<div class="[&_p]:mt-4"></div>')
    expect(res).toBe('<div class="_bl__am__p_br__c_mt-4"></div>')
  })

  it('[@supports(display:grid)]:grid', () => {
    const res = complexHandler('<div class="flex [@supports(display:grid)]:grid"></div>')
    expect(res).toBe('<div class="flex _bl__at_supports_pl_display_c_grid_qr__br__c_grid"></div>')
  })

  it('[@media(any-hover:hover){&:hover}]:opacity-100', () => {
    const res = complexHandler('<button type="button" class="[@media(any-hover:hover){&:hover}]:opacity-100"></button>')
    expect(res).toBe('<button type="button" class="_bl__at_media_pl_any-hover_c_hover_qr__bal__am__c_hover_bar__br__c_opacity-100"></button>')
  })

  it('[&_.u-count-down__text]:!text-red-400', () => {
    const res = complexHandler('<view class="after:border-none after:content-[\'Hello_World\']">after:border-none</view>')
    expect(res).toBe('<view class="after_c_border-none after_c_content-_bl__q_Hello_World_q__br_">after:border-none</view>')
  })
})

describe('simpleHandler', () => {
  it('[&:nth-child(3)]:underline', () => {
    const res = simpleHandler('<li class="[&:nth-child(3)]:underline">{item}</li>')
    expect(res).toBe('<li class="_ncnth-child_3__cunderline">{item}</li>')
  })

  it('lg:[&:nth-child(3)]:hover:underline', () => {
    const res = simpleHandler('<li class="lg:[&:nth-child(3)]:hover:underline">{item}</li>')
    expect(res).toBe('<li class="lgc_ncnth-child_3__chovercunderline">{item}</li>')
  })

  it('[&_p]:mt-4', () => {
    const res = simpleHandler('<div class="[&_p]:mt-4"></div>')
    expect(res).toBe('<div class="_n_p_cmt-4"></div>')
  })

  it('[@supports(display:grid)]:grid', () => {
    const res = simpleHandler('<div class="flex [@supports(display:grid)]:grid"></div>')
    expect(res).toBe('<div class="flex _jsupports_displaycgrid__cgrid"></div>')
  })

  it('[@media(any-hover:hover){&:hover}]:opacity-100', () => {
    const res = simpleHandler('<button type="button" class="[@media(any-hover:hover){&:hover}]:opacity-100"></button>')
    expect(res).toBe('<button type="button" class="_jmedia_any-hoverchover__nchover__copacity-100"></button>')
  })

  it('[&_.u-count-down__text]:!text-red-400', () => {
    const res = simpleHandler('<view class="after:border-none after:content-[\'Hello_World\']">after:border-none</view>')
    expect(res).toBe('<view class="aftercborder-none afterccontent-_qHello_Worldq_">after:border-none</view>')
  })
})
