import { getCss } from '../helpers/getTwCss'
import { getOptions } from '@/options'

describe('responsive-design', () => {
  let styleHandler: ReturnType<typeof getOptions>['styleHandler']
  beforeEach(() => {
    styleHandler = getOptions().styleHandler
  })
  it('xl:text-sm', async () => {
    const res = await getCss('xl:text-sm')
    expect(res.css).toMatchSnapshot()

    expect(
      await styleHandler(res.css, {
        isMainChunk: true,
      }),
    ).toMatchSnapshot()
  })

  it('2xl:text-sm', async () => {
    const res = await getCss('2xl:text-sm')
    expect(res.css).toMatchSnapshot()
    // @ts-ignore
    expect(await styleHandler(res.css)).toMatchSnapshot()
  })

  it('space-y-4 cssChildCombinatorReplaceValue string array type', async () => {
    const res = await getCss('space-y-4')
    expect(res.css).toMatchSnapshot()

    expect(
      await styleHandler(res.css, {
        isMainChunk: true,
        cssChildCombinatorReplaceValue: ['view', 'text'],
      }),
    ).toMatchSnapshot()
  })

  it('space-y-4 cssChildCombinatorReplaceValue string type', async () => {
    const res = await getCss('space-y-4')
    expect(res.css).toMatchSnapshot()

    expect(
      await styleHandler(res.css, {
        isMainChunk: true,
        cssChildCombinatorReplaceValue: 'view,text,button,input ~ view,text,button,input',
      }),
    ).toMatchSnapshot()
  })
})
