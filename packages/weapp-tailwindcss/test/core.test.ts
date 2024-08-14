import scssParser from 'postcss-scss'
import { createContext } from '@/core'
import { getCss } from '#test/helpers/getTwCss'

describe('core', () => {
  it('common usage case 0', async () => {
    const ctx = createContext()
    const wxml = await ctx.transformWxml('<view class="mt-[8px]" wx:if="{{ xxx.length > 0 }}">')
    expect(wxml).toBe('<view class="mt-_8px_" wx:if="{{ xxx.length > 0 }}">')
    const { css: wxss, map: cssMap } = await ctx.transformWxss(`.after\\:ml-0\\.5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    expect(wxss).toBe(`.aftercml-0d5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    expect(cssMap).toMatchSnapshot()
    const content = `const classNames = ['mb-[1.5rem]']`
    await getCss(content)

    const { code, map } = await ctx.transformJs(content)
    expect(code).toBe(`const classNames = ['mb-_1d5rem_']`)
    expect(map).toMatchSnapshot()
  })

  it('common usage case 1', async () => {
    const ctx = createContext()
    const wxml = await ctx.transformWxml('<view class="mt-[8px]" wx:if="{{ xxx.length > 0 }}">')
    expect(wxml).toBe('<view class="mt-_8px_" wx:if="{{ xxx.length > 0 }}">')
    const { css, map: cssMap } = await ctx.transformWxss(`.after\\:ml-0\\.5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    expect(css).toBe(`.aftercml-0d5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    expect(cssMap).toMatchSnapshot()
    const content = `const classNames = ['mb-[1.5rem]']`
    await getCss(content)
    const runtimeSet = new Set<string>()
    const { code, map } = await ctx.transformJs(content, { runtimeSet })
    expect(code).toBe(`const classNames = ['mb-[1.5rem]']`)
    expect(map).toMatchSnapshot()
  })

  it('scss usage case 1', async () => {
    const ctx = createContext()
    const wxml = await ctx.transformWxml('<view class="mt-[8px]" wx:if="{{ xxx.length > 0 }}">')
    expect(wxml).toBe('<view class="mt-_8px_" wx:if="{{ xxx.length > 0 }}">')
    const { css: wxss } = await ctx.transformWxss(`// xx`, {
      isMainChunk: true,
      postcssOptions: {
        options: {
          parser: scssParser,
        },
      },
    })
    expect(wxss).toBe(`/* xx*/`)
    const content = `const classNames = ['mb-[1.5rem]']`
    await getCss(content)
    const runtimeSet = new Set<string>()
    const { code, map } = await ctx.transformJs(content, { runtimeSet })
    expect(code).toBe(`const classNames = ['mb-[1.5rem]']`)
    expect(map).toMatchSnapshot()
  })
})
