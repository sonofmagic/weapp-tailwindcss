import { customTempleteHandler } from '@/wxml/utils'
import { SimpleMappingChars2String } from '@/dic'

describe('customTempleteHandler', () => {
  it('invalid customAttributesEntities options', () => {
    const res = customTempleteHandler('<view class="p-[20px]"></view>', {
      // @ts-ignore
      customAttributesEntities: {},
      escapeMap: SimpleMappingChars2String
    })
    expect(res).toBe('<view class="p-_20px_"></view>')
  })
})
