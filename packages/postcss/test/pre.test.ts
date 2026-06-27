import postcss from 'postcss'
import { postcssWeappTailwindcssPrePlugin } from '@/plugins/pre'

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

  it('removes Tailwind v4 unsupported supports, display-p3 media, and empty declaration parents', async () => {
    const { css } = await postcss([postcssWeappTailwindcssPrePlugin({})]).process([
      '@supports (background-image: linear-gradient(in lab, red, red)){.gradient{color:red}}',
      '@supports (color: color(display-p3 0 0 0%)){.p3{color:red}}',
      '@media (color-gamut: p3){.p3-media{color:color(display-p3 1 0 0)}}',
      '@media screen{@media (color-gamut: p3){.nested-p3{color:red}}}',
      '.color{color:color(display-p3 1 0 0)}',
      '.keep{color:red}',
    ].join('\n'), { from: undefined })

    expect(css).toContain('.keep{color:red}')
    expect(css).not.toContain('oklab')
    expect(css).not.toContain('display-p3')
    expect(css).not.toContain('color-gamut')
    expect(css).not.toContain('.color')
    expect(css).not.toContain('@media screen')
  })

  it('unwraps Tailwind v4 modern-check layers in main chunks', async () => {
    const { css } = await postcss([postcssWeappTailwindcssPrePlugin({})]).process([
      '@layer properties {}',
      '@layer properties {',
      '  @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {',
      '    *, ::before, ::after { --tw-shadow: 0 0 #0000; }',
      '  }',
      '}',
      '@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {',
      '  @layer base { *, ::before, ::after { --tw-ring: 0 0 #0000; } }',
      '}',
    ].join('\n'), { from: undefined })

    expect(css).toContain('--tw-shadow')
    expect(css).toContain('--tw-ring')
    expect(css).not.toContain('@layer')
    expect(css).not.toContain('@supports')
  })

  it('keeps layer wrapping when pre plugin is not running on the main chunk', async () => {
    const { css } = await postcss([postcssWeappTailwindcssPrePlugin({ isMainChunk: false })]).process('@layer utilities {.card{color:red}}', { from: undefined })

    expect(css).toContain('@layer utilities')
    expect(css).toContain('.card')
  })
})
