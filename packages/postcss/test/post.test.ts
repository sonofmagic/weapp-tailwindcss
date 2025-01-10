import { postcssWeappTailwindcssPostPlugin } from '@/plugins/post'
import postcss from 'postcss'

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
})
