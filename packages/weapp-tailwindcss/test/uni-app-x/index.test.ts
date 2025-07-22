import { createGetCase, fixturesRootPath } from '#test/util'
import { getCompilerContext } from '@/context'
import { transformNVue } from '@/uni-app-x'

const getCase = createGetCase(fixturesRootPath)

describe('uni-app-x', () => {
  it('should ', async () => {
    const { jsHandler } = getCompilerContext()
    const vueRawCode = await getCase('uni-app-x/index.uvue')
    const classNameSet = new Set<string>()
    classNameSet.add('text-[#258f27]')

    expect(transformNVue(vueRawCode, 'index.nvue', jsHandler, classNameSet)).toMatchSnapshot()
  })
})
