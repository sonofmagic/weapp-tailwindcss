import { getCss } from '#test/helpers/getTwCss'
import scssParser from 'postcss-scss'

import { createContext } from '@/core'

describe('core', () => {
  it('common usage case 0', async () => {
    const ctx = createContext()
    const wxml = await ctx.transformWxml('<view class="mt-[8px]" wx:if="{{ xxx.length > 0 }}">')
    expect(wxml).toBe('<view class="mt-_b8px_B" wx:if="{{ xxx.length > 0 }}">')
    const { css: wxss, map: cssMap } = await ctx.transformWxss(`.after\\:ml-0\\.5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    expect(wxss).toBe(`.after_cml-0_d5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    expect(cssMap).toMatchSnapshot()
    const content = `const classNames = ['mb-[1.5rem]']`
    await getCss(content)

    const { code, map } = await ctx.transformJs(content)
    expect(code).toBe(`const classNames = ['mb-_b1_d5rem_B']`)
    expect(map).toMatchSnapshot()
  })

  it('common usage case 1', async () => {
    const ctx = createContext()
    const wxml = await ctx.transformWxml('<view class="mt-[8px]" wx:if="{{ xxx.length > 0 }}">')
    expect(wxml).toBe('<view class="mt-_b8px_B" wx:if="{{ xxx.length > 0 }}">')
    const { css, map: cssMap } = await ctx.transformWxss(`.after\\:ml-0\\.5::after {
      content: var(--tw-content);
      margin-left: 0.125rem;
    }`)
    expect(css).toBe(`.after_cml-0_d5::after {
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
    expect(wxml).toBe('<view class="mt-_b8px_B" wx:if="{{ xxx.length > 0 }}">')
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

describe('core transform functions', () => {
  it('should transform WXML with runtimeSet', async () => {
    const ctx = createContext()
    const rawWxml = '<view class="mt-[8px]" wx:if="{{ xxx.length > 0 }}">'
    const runtimeSet = new Set(['mt-[8px]'])
    const options = { runtimeSet }
    const transformedWxml = await ctx.transformWxml(rawWxml, options)
    expect(transformedWxml).toBe('<view class="mt-_b8px_B" wx:if="{{ xxx.length > 0 }}">')
  })

  it('should transform JS with runtimeSet', async () => {
    const ctx = createContext()
    const rawJs = `const classNames = ['mb-[1.5rem]']`
    const runtimeSet = new Set(['mb-[1.5rem]'])
    const options = { runtimeSet }
    const { code } = await ctx.transformJs(rawJs, options)
    expect(code).toBe(`const classNames = ['mb-_b1_d5rem_B']`)
  })

  it('should handle empty runtimeSet', async () => {
    const ctx = createContext()
    const rawWxml = '<view class="mt-[8px]" wx:if="{{ xxx.length > 0 }}">'
    const runtimeSet = new Set<string>()

    const transformedWxml = await ctx.transformWxml(rawWxml, {
      runtimeSet,
    })
    expect(transformedWxml).toBe('<view class="mt-_b8px_B" wx:if="{{ xxx.length > 0 }}">')
  })
})

describe('core hot update class escaping', () => {
  it('keeps newly added arbitrary class in js unchanged when runtimeSet is stale', async () => {
    const ctx = createContext()

    await ctx.transformJs(`const initial = ['text-[12px]']`, {
      runtimeSet: new Set(['text-[12px]']),
    })

    const { code } = await ctx.transformJs(`const classNames = ['text-[23.43px]']`)
    expect(code).toBe(`const classNames = ['text-[23.43px]']`)
  })

  it('keeps newly added dotted utility class in js unchanged when runtimeSet is stale', async () => {
    const ctx = createContext()

    await ctx.transformJs(`const initial = ['space-y-2']`, {
      runtimeSet: new Set(['space-y-2']),
    })

    const { code } = await ctx.transformJs(`const classNames = ['space-y-2.5']`)
    expect(code).toBe(`const classNames = ['space-y-2.5']`)
  })

  it('keeps newly added arbitrary class in wxml expression unchanged when runtimeSet is stale', async () => {
    const ctx = createContext()

    const transformed = await ctx.transformWxml(
      `<view class="{{ isLarge ? 'text-[23.43px]' : 'text-[12px]' }}"></view>`,
      {
        runtimeSet: new Set(['text-[12px]']),
      },
    )

    expect(transformed).toContain('text-[23.43px]')
    expect(transformed).toContain('text-_b12px_B')
  })

  it('keeps newly added dotted utility class in wxml expression unchanged when runtimeSet is stale', async () => {
    const ctx = createContext()

    const transformed = await ctx.transformWxml(
      `<view class="{{ isLarge ? 'space-y-2.5' : 'space-y-2' }}"></view>`,
      {
        runtimeSet: new Set(['space-y-2']),
      },
    )

    expect(transformed).toContain('space-y-2.5')
    expect(transformed).toContain('space-y-2')
  })

  it('transforms arbitrary class in vue-like template class attribute', async () => {
    const ctx = createContext()
    const transformed = await ctx.transformWxml('<view class="text-[23.43px]"></view>', {
      runtimeSet: new Set(['text-[12px]']),
    })

    expect(transformed).toBe('<view class="text-_b23_d43px_B"></view>')
  })
})
