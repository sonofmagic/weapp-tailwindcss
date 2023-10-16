// import plugin from 'tailwindcss/plugin'
import postcss from 'postcss'
// import twPlugin from '../../dist/css-macro'
import twPlugin from '@/css-macro'
import { getCss } from '#test/helpers/getTwCss'
import postcssPlugin from '@/css-macro/postcss'

// not screen and (weapp-tw-platform:MP-WEIXIN)
// not screen and (weapp-tw-platform:uniVersion > 3.9)
// not screen and (weapp-tw-platform:H5 || MP-WEIXIN)
describe('css-macro tailwindcss plugin', () => {
  it('dynamic case 0', async () => {
    const { css } = await getCss('ifdef-[MP-WEIXIN]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin]
      }
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 1', async () => {
    const { css } = await getCss('ifndef-[MP-WEIXIN]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin]
      }
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 2', async () => {
    const { css } = await getCss('ifndef-[uniVersion>3.9]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin]
      }
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 3', async () => {
    const { css } = await getCss('ifndef-[uniVersion_>_3.9]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin]
      }
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 4', async () => {
    const { css } = await getCss('ifndef-[uni\\_version_>_3.9]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin]
      }
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic case 5', async () => {
    const { css } = await getCss('ifndef-[H5||MP-WEIXIN]:bg-blue-500', {
      twConfig: {
        plugins: [twPlugin]
      }
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('dynamic apply case 6', async () => {
    const { css } = await getCss('', {
      css: `.apply-test {
        @apply ifdef-[H5||MP-WEIXIN]:bg-blue-400 ifndef-[H5||MP-WEIXIN]:bg-red-400;
      }`,
      twConfig: {
        plugins: [twPlugin]
      }
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('postcss expand case 0', async () => {
    const { css: cssOutput } = await postcss(postcssPlugin).process(
      `@media not screen and (weapp-tw-platform:"MP-WEIXIN") {
      .-wxcbg-red-500 {
          --tw-bg-opacity: 1;
          background-color: rgb(239 68 68 / var(--tw-bg-opacity));
      }
      }`,
      {
        from: undefined
      }
    )
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('postcss expand case 1', async () => {
    const { css } = await postcss(postcssPlugin)
      .process(
        `@media not screen and (weapp-tw-platform:"MP-WEIXIN") {
        .ifndef-_MP-WEIXIN_cbg-red-500 {
            --tw-bg-opacity: 1;
            background-color: rgb(239 68 68 / var(--tw-bg-opacity));
        }
        }`,
        {
          from: undefined
        }
      )
      .async()
    expect(css).toMatchSnapshot('postcss')
  })

  it('static case 0', async () => {
    const { css } = await getCss('wx:bg-blue-500', {
      twConfig: {
        plugins: [
          twPlugin({
            variantsMap: {
              wx: 'MP-WEIXIN'
            }
          })
        ]
      }
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('static case 1', async () => {
    const { css } = await getCss('-wx:bg-blue-500', {
      twConfig: {
        plugins: [
          twPlugin({
            variantsMap: {
              '-wx': {
                value: 'MP-WEIXIN',
                negative: true
              }
            }
          })
        ]
      }
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('static case 2', async () => {
    const { css } = await getCss('hv:bg-blue-500', {
      twConfig: {
        plugins: [
          twPlugin({
            variantsMap: {
              hv: {
                value: 'uniVersion > 3.9'
              }
            }
          })
        ]
      }
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('static case 3', async () => {
    const { css } = await getCss('mv:bg-blue-500', {
      twConfig: {
        plugins: [
          twPlugin({
            variantsMap: {
              mv: {
                value: 'H5 || MP-WEIXIN'
              }
            }
          })
        ]
      }
    })
    expect(css).toMatchSnapshot('tw')
    const { css: cssOutput } = await postcss(postcssPlugin).process(css, {
      from: undefined
    })
    expect(cssOutput).toMatchSnapshot('postcss')
  })

  it('comment error case 0', () => {
    let root = postcss.parse('/**\n*/')
    expect(root).toBeDefined()
    root = postcss.parse('/*  #ifdef  %PLATFORM%  */\n.a{}\n/*  #endif  */')
    expect(root).toBeDefined()
    root = postcss.parse('/*  #ifdef  %PLATFORM%  */\n.a{}/*  #endif  */')
    expect(root).toBeDefined()
  })
})
