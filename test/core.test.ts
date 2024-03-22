import { createContext } from '@/core'
import { getCss } from '#test/helpers/getTwCss'
describe('core', () => {
  it('common usage case 0', async () => {
    const ctx = createContext()
    const wxml = await ctx.transformWxml('<view class="mt-[8px]" wx:if="{{ xxx.length > 0 }}">')
    expect(wxml).toBe('<view class="mt-_8px_" wx:if="{{ xxx.length > 0 }}">')
    const wxss = await ctx.transformWxss(`.after\\:ml-0\\.5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    expect(wxss).toBe(`.aftercml-0d5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    const content = `const classNames = ['mb-[1.5rem]']`
    await getCss(content)

    const js = await ctx.transformJs(content)
    expect(js).toBe(`const classNames = ['mb-_1d5rem_']`)
  })

  it('common usage case 1', async () => {
    const ctx = createContext()
    const wxml = await ctx.transformWxml('<view class="mt-[8px]" wx:if="{{ xxx.length > 0 }}">')
    expect(wxml).toBe('<view class="mt-_8px_" wx:if="{{ xxx.length > 0 }}">')
    const wxss = await ctx.transformWxss(`.after\\:ml-0\\.5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    expect(wxss).toBe(`.aftercml-0d5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    const content = `const classNames = ['mb-[1.5rem]']`
    await getCss(content)
    const runtimeSet = new Set<string>()
    const js = await ctx.transformJs(content, { runtimeSet })
    expect(js).toBe(`const classNames = ['mb-[1.5rem]']`)
  })
})
