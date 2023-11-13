import { createContext } from '@/core'

describe('core', () => {
  it('common usage case 0', async () => {
    const ctx = createContext()
    const wxml = ctx.transformWxml('<view class="mt-[8px]" wx:if="{{ xxx.length > 0 }}">')
    expect(wxml).toBe('<view class="mt-_8px_" wx:if="{{ xxx.length > 0 }}">')
    const wxss = await ctx.transformWxss(`.after\\:ml-0\\.5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    expect(wxss).toBe(`.aftercml-0d5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    const runtimeSet = new Set<string>()
    runtimeSet.add('mb-[1.5rem]')
    const js = ctx.transformJs(`const classNames = ['mb-[1.5rem]']`, {
      runtimeSet
    })
    expect(js).toBe(`const classNames = ['mb-_1d5rem_']`)
  })
})
