import postcss from 'postcss'
import { createStyleHandler } from '@/handler'
import { postcssWeappTailwindcssPostPlugin } from '@/plugins/post'

describe('postcss post plugin', () => {
  it('postcss process', () => {
    const rawCode = `.b,.a:hover{color:red;} {color:red;} {color:red;}`
    const { css } = postcss([
      postcssWeappTailwindcssPostPlugin({
        isMainChunk: true,
      }),
    ]).process(rawCode)
    expect(css).toMatchSnapshot()
  })

  it('postcss process case 0', () => {
    const rawCode = `.b,.a:hover{color:red;} 
    {color:red;} 
    {color:bule;}
    
    
  {xxx:xxx}`
    const { css } = postcss([
      postcssWeappTailwindcssPostPlugin({
        isMainChunk: true,
      }),
    ]).process(rawCode)
    expect(css).toMatchSnapshot()
  })

  it('preserves standalone conditional placeholders for incremental css assembly', async () => {
    const input = '@media (min-width: 64rem) { /* incremental placeholder */ }'
    const result = await postcss([
      postcssWeappTailwindcssPostPlugin({
        isMainChunk: true,
      }),
    ]).process(input, { from: undefined })

    expect(result.css).toBe(input)
  })

  it('removes nested empty blocks after the postcss lifecycle completes', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler('@media (min-width: 64rem) { @supports (display: grid) {} }')

    expect(css).toBe('')
  })

  it('keeps comment-only incremental placeholders after postprocessing', async () => {
    const input = '@media (min-width: 64rem) { /* incremental placeholder */ }'
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(input)

    expect(css).toBe(input)
  })
})
