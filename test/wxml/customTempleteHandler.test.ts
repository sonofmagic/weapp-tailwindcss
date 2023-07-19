// @ts-nocheck
import { customTempleteHandler } from '@/wxml/utils'
import { SimpleMappingChars2String } from '@/dic'

describe('customTempleteHandler', () => {
  it('invalid customAttributesEntities options', () => {
    const res = customTempleteHandler('<view class="p-[20px]"></view>', {
      customAttributesEntities: [],
      escapeMap: SimpleMappingChars2String
    })
    expect(res).toBe('<view class="p-_20px_"></view>')
  })

  it('disabledDefaultTemplateHandler case 0', () => {
    const testCase = '<view class="p-[20px]" hover-class="w-[99px]"></view>'
    const res = customTempleteHandler(testCase, {
      customAttributesEntities: [],
      disabledDefaultTemplateHandler: true
    })
    expect(res).toBe(testCase)
  })

  it('disabledDefaultTemplateHandler case 1', () => {
    const testCase = '<view class="p-[20px]" hover-class="w-[99px]"></view>'
    // 'p-[20px] hover-class='
    const res = customTempleteHandler(testCase, {
      customAttributesEntities: [['*', /[A-Za-z]?[A-Za-z-]*[Cc]lass/]],
      disabledDefaultTemplateHandler: true
    })
    expect(res).toBe('<view class="p-_20px_" hover-class="w-_99px_"></view>')
  })
})
