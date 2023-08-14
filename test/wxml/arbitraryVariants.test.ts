import { templateHandler } from '#test/v2/wxml'
import { MappingChars2String, SimpleMappingChars2String } from '@/escape'

// https://tailwindcss.com/docs/hover-focus-and-other-states#using-arbitrary-variants
function complexHandler(str: string) {
  return templateHandler(str, {
    escapeMap: MappingChars2String
  })
}
// eslint-disable-next-line no-unused-vars
function simpleHandler(str: string) {
  return templateHandler(str, {
    escapeMap: SimpleMappingChars2String
  })
}

describe('arbitrary variants', () => {
  test('[&:nth-child(3)]:underline', () => {
    const res = complexHandler('<li class="[&:nth-child(3)]:underline">{item}</li>')
    expect(res).toBe('<li class="_bl__am__c_nth-child_pl_3_qr__br__c_underline">{item}</li>')
  })

  test('lg:[&:nth-child(3)]:hover:underline', () => {
    const res = complexHandler('<li class="lg:[&:nth-child(3)]:hover:underline">{item}</li>')
    expect(res).toBe('<li class="lg_c__bl__am__c_nth-child_pl_3_qr__br__c_hover_c_underline">{item}</li>')
  })

  test('[&_p]:mt-4', () => {
    const res = complexHandler('<div class="[&_p]:mt-4"></div>')
    expect(res).toBe('<div class="_bl__am__p_br__c_mt-4"></div>')
  })

  test('[@supports(display:grid)]:grid', () => {
    const res = complexHandler('<div class="flex [@supports(display:grid)]:grid"></div>')
    expect(res).toBe('<div class="flex _bl__at_supports_pl_display_c_grid_qr__br__c_grid"></div>')
  })

  test('[@media(any-hover:hover){&:hover}]:opacity-100', () => {
    const res = complexHandler('<button type="button" class="[@media(any-hover:hover){&:hover}]:opacity-100"></button>')
    expect(res).toBe('<button type="button" class="_bl__at_media_pl_any-hover_c_hover_qr__bal__am__c_hover_bar__br__c_opacity-100"></button>')
  })

  test('[&_.u-count-down__text]:!text-red-400', () => {
    const res = complexHandler('<view class="after:border-none after:content-[\'Hello_World\']">after:border-none</view>')
    expect(res).toBe('<view class="after_c_border-none after_c_content-_bl__q_Hello_World_q__br_">after:border-none</view>')
  })
})
