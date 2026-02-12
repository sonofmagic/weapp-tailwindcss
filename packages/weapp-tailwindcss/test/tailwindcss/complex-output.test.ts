import { getCompilerContext } from '@/context'
import { replaceWxml } from '@/wxml/shared'
import { getCss } from '../helpers/getTwCss'

const complexClassTokens = [
  '[&:nth-child(3)]:underline',
  'lg:[&:nth-child(3)]:hover:underline',
  '[@supports(display:grid)]:grid',
  '[@media(any-hover:hover){&:hover}]:opacity-100',
  'group-[:nth-of-type(3)_&]:block',
  'group-[.is-published]:block',
  'w-[calc(100%_-_17px)]',
  'grid-cols-[200rpx_minmax(900rpx,_1fr)_17px]',
  'text-black/[0.37]',
  'ring-[1.7px]',
  'shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]',
  'before:content-[\'hello_world\']',
  'after:content-[\'[\']',
  '[mask-type:luminance]',
  'hover:[mask-type:alpha]',
  '[--scroll-offset:56px]',
  'lg:[--scroll-offset:44px]',
  'text-[length:var(--step-2)]',
] as const

describe('tailwind complex syntax output', () => {
  it('generates wxss selectors for complex syntax corpus', async () => {
    const rawContent = `<view class="group ${complexClassTokens.join(' ')}"></view>`
    const { css } = await getCss(rawContent)
    expect(css).toMatchSnapshot('tailwind-css')

    const { styleHandler } = getCompilerContext()
    const { css: wxss } = await styleHandler(css, {
      isMainChunk: true,
      cssChildCombinatorReplaceValue: ['view'],
    })

    expect(wxss).toMatchSnapshot('wxss')

    const escapedSelectors = complexClassTokens.map(classToken => `.${replaceWxml(classToken)}`)
    const matchedCount = escapedSelectors.filter(selector => wxss.includes(selector)).length

    // Some hover-driven variants are intentionally dropped by styleHandler in mini-program output.
    expect(matchedCount).toBeGreaterThanOrEqual(12)

    const mustContain = [
      '[&:nth-child(3)]:underline',
      '[@supports(display:grid)]:grid',
      'group-[:nth-of-type(3)_&]:block',
      'group-[.is-published]:block',
      'w-[calc(100%_-_17px)]',
      'grid-cols-[200rpx_minmax(900rpx,_1fr)_17px]',
      'text-black/[0.37]',
      'ring-[1.7px]',
      'before:content-[\'hello_world\']',
      '[mask-type:luminance]',
      '[--scroll-offset:56px]',
    ] as const

    for (const classToken of mustContain) {
      expect(wxss).toContain(`.${replaceWxml(classToken)}`)
    }
  })
})
