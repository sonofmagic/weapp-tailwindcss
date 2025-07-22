import { createGetCase, fixturesRootPath } from '#test/util'
import { getCompilerContext } from '@/context'
import { transformUVue } from '@/uni-app-x'

const getCase = createGetCase(fixturesRootPath)

describe('uni-app-x', () => {
  it('should ', async () => {
    const { jsHandler } = getCompilerContext()
    const vueRawCode = await getCase('uni-app-x/index.uvue')
    const classNameSet = new Set<string>()
    classNameSet.add('text-[#258f27]')
    classNameSet.add('text-[100px]')
    classNameSet.add('py-[22.32px]')

    expect(transformUVue(vueRawCode, 'index.uvue', jsHandler, classNameSet)).toMatchSnapshot()
  })
})
