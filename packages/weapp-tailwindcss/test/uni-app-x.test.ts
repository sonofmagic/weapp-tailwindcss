import { getCompilerContext } from '@/context'
import { createJsHandler } from '@/js'
import { createGetCase, fixturesRootPath } from './util'

const getCase = createGetCase(fixturesRootPath)

describe('uni-app-x', () => {
  it('uvue.ts case 0', async () => {
    const jsHandler = createJsHandler({
      babelParserOptions: {
        sourceType: 'unambiguous',
        plugins: [
          'typescript',
        ],
      },
    })
    const set = new Set<string>()
    set.add('mt-[32.43rpx]')
    set.add('bg-[#322323]')
    set.add('text-[#844343]')
    const { code } = jsHandler(
      await getCase('uni-app-x/index.uvue.ts'),
      set,
      {

      },
    )
    expect(code).toMatchSnapshot()
  })

  it('uvue.ts case 1', async () => {
    const { jsHandler, styleHandler } = getCompilerContext({
      uniAppX: true,
    })
    const set = new Set<string>()
    set.add('mt-[32.43rpx]')
    set.add('bg-[#322323]')
    set.add('text-[#844343]')
    const { code } = jsHandler(
      await getCase('uni-app-x/index.uvue.ts'),
      set,
      {
        babelParserOptions: {
          sourceType: 'unambiguous',
          plugins: [
            'typescript',
          ],
        },
      },
    )
    expect(code).toMatchSnapshot()

    const { css } = await styleHandler(
      await getCase('uni-app-x/app.css'),
      {
        uniAppX: true,
      },
    )
    expect(css).toMatchSnapshot('css')
  })
})
