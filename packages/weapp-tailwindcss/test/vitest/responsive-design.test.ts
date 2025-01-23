import { getCompilerContext } from '@/context'
import { getCss } from '../helpers/getTwCss'

describe('responsive-design', () => {
  let styleHandler: ReturnType<typeof getCompilerContext>['styleHandler']
  beforeEach(() => {
    styleHandler = getCompilerContext().styleHandler
  })
  it('xl:text-sm', async () => {
    const res = await getCss('xl:text-sm')
    expect(res.css).toMatchSnapshot()
    const { css } = await styleHandler(res.css, {
      isMainChunk: true,
    })
    expect(
      css,
    ).toMatchSnapshot()
  })

  it('2xl:text-sm', async () => {
    const res = await getCss('2xl:text-sm')
    expect(res.css).toMatchSnapshot()
    const { css } = await styleHandler(res.css)
    // @ts-ignore
    expect(css).toMatchSnapshot()
  })

  it('space-y-4 cssChildCombinatorReplaceValue string array type', async () => {
    const res = await getCss('space-y-4')
    expect(res.css).toMatchSnapshot()
    const { css } = await styleHandler(res.css, {
      isMainChunk: true,
      cssChildCombinatorReplaceValue: ['view', 'text'],
    })
    expect(
      css,
    ).toMatchSnapshot()
  })

  it('space-y-4 cssChildCombinatorReplaceValue string type', async () => {
    const res = await getCss('space-y-4')
    expect(res.css).toMatchSnapshot()
    const { css } = await styleHandler(res.css, {
      isMainChunk: true,
      cssChildCombinatorReplaceValue: 'view,text,button,input ~ view,text,button,input',
    })
    expect(
      css,
    ).toMatchSnapshot()
  })
})
