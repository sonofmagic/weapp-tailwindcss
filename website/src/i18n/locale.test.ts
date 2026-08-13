import { describe, expect, it } from 'vitest'
import { stripLocalePrefix, toLocalePath } from './locale'

describe('locale paths', () => {
  it('重复执行语言切换时仍返回唯一的规范前缀', () => {
    expect(stripLocalePrefix('/en/en/en')).toBe('/')
    expect(stripLocalePrefix('/en/en/docs/intro')).toBe('/docs/intro')
    expect(toLocalePath('/en/en/en', 'en')).toBe('/en/')
    expect(toLocalePath('/en/en/docs/intro', 'en')).toBe('/en/docs/intro')
    expect(toLocalePath('/en/en/docs/intro', 'zh-cn')).toBe('/docs/intro')
  })

  it('规范化重复路径分隔符但不改写普通路径段', () => {
    expect(toLocalePath('//en///docs//intro', 'en')).toBe('/en/docs/intro')
    expect(toLocalePath('/english/docs', 'en')).toBe('/en/english/docs')
  })
})
