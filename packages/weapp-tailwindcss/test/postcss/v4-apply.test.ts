import postcss from 'postcss'
import { describe, expect, it } from 'vitest'
import { weappTailwindcssPostcssPlugin } from '@/postcss'

describe('postcss v4 @apply', () => {
  it('expands apply-only local styles with original selectors', async () => {
    const css = [
      '.content { @apply flex flex-col items-center py-4; }',
      '.test { @apply flex mt-3 h-[100px] w-[222.222px] items-center justify-center rounded-[40px] bg-[#31edd8]/[0.54]; }',
    ].join('\n')

    const result = await postcss([
      weappTailwindcssPostcssPlugin({
        packageName: 'tailwindcss',
        base: process.cwd(),
        projectRoot: process.cwd(),
        candidates: [
          'flex',
          'flex-col',
          'items-center',
          'py-4',
          'mt-3',
          'h-[100px]',
          'w-[222.222px]',
          'justify-center',
          'rounded-[40px]',
          'bg-[#31edd8]/[0.54]',
        ],
        generator: {
          target: 'weapp',
        },
        styleOptions: {
          isMainChunk: false,
          rem2rpx: true,
        },
      }),
    ]).process(css, { from: 'pages/index/index.uvue' })

    expect(result.css).toContain('.content')
    expect(result.css).toContain('.test')
    expect(result.css).toContain('display: flex')
    expect(result.css).toContain('flex-direction: column')
    expect(result.css).toContain('align-items: center')
    expect(result.css).toContain('padding-top: calc(var(--spacing, 0.25rem) * 4)')
    expect(result.css).toContain('background-color: rgba(49, 237, 216, 0.54)')
    expect(result.css).not.toContain('@apply')
    expect(result.css).not.toContain('@reference')
  })
})
