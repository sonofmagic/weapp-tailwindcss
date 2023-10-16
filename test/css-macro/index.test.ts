// import plugin from 'tailwindcss/plugin'
import postcss from 'postcss'
import twPlugin from '../../dist/css-macro'
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
})
