import { createTemplateClassRegexp, createTempleteHandlerMatchRegexp } from '@/reg'

describe('regexp-maker', () => {
  it('TemplateClassRegexp single attr', () => {
    const reg = createTempleteHandlerMatchRegexp('l-o-v-e-r', 'i-love-you')

    expect(reg.test('<l-o-v-e-r i-love-you="">l-o-v-e-r</l-o-v-e-r>')).toBe(true)
    expect(reg.test('<l-o-v-e-r i-hate-you="">l-o-v-e-r</l-o-v-e-r>')).toBe(false)
  })
  it('TemplateClassRegexp multiple attrs', () => {
    const reg = createTempleteHandlerMatchRegexp('l-o-v-e-r', ['i', 'love', 'you'])
    expect(reg.test('<l-o-v-e-r i="" love="" you="">l-o-v-e-r</l-o-v-e-r>')).toBe(true)
    expect(reg.test('<l-o-v-e-r ii="" love="" you="">l-o-v-e-r</l-o-v-e-r>')).toBe(false)
  })

  it('TemplateClassRegexp single option', () => {
    const reg = createTemplateClassRegexp('shit')
    expect(reg.test(' a b c shit="happens" ')).toBe(true)
    expect(reg.test(' a b c sssshit="happens" ')).toBe(false)
    expect(reg.test(' a b c shitttttt="happens" ')).toBe(false)
  })
})
