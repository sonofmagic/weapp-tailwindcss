import { postcssWeappTailwindcssPrePlugin } from '@/plugins/pre'
import postcss from 'postcss'

describe('pre plugin', () => {
  it('isAtMediaHover case 0', async () => {
    const { css } = await postcss([postcssWeappTailwindcssPrePlugin]).process(`
    @media not (hover: none){

    }
    `)
    expect(css).toMatchSnapshot()
  })

  it('isAtMediaHover case 1', async () => {
    const { css } = await postcss([postcssWeappTailwindcssPrePlugin]).process(`
    @media not (hover: hover){

    }
    `)
    expect(css).toMatchSnapshot()
  })

  it('isAtMediaHover case 2', async () => {
    const { css } = await postcss([postcssWeappTailwindcssPrePlugin]).process(`
    @media not (hover: hover){
      .a{

      }
    }
    `)
    expect(css).toMatchSnapshot()
  })

  it('isAtMediaHover case 3', async () => {
    const { css } = await postcss([postcssWeappTailwindcssPrePlugin]).process(`
    @media not (hover: hover){
      .a{
        color: red;
      }
    }
    `)
    expect(css).toMatchSnapshot()
  })
})
