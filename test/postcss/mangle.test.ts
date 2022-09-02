import { styleHandler } from '@/postcss'
import ClassGenerator from '@/mangle/classGenerator'
import { cssCasePath, createGetCase, createPutCase } from '../util'
// import { getOptions } from '@/defaults'
const getCase = createGetCase(cssCasePath)
// @ts-ignore
// eslint-disable-next-line no-unused-vars
const putCase = createPutCase(cssCasePath)
describe('[postcss] mangle', () => {
  it('mangle case with empty classGenerator', async () => {
    // const options = getOptions()
    const testCase = await getCase('mangle-nested-0.css')
    const classGenerator = new ClassGenerator()

    const result = styleHandler(testCase, {
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      isMainChunk: true,
      replaceUniversalSelectorWith: 'view',
      classGenerator
    })
    expect(result).toMatchSnapshot()
  })

  it('mangle case 0', async () => {
    // const options = getOptions()
    const testCase = await getCase('mangle-nested-0.css')
    const classGenerator = new ClassGenerator()
    const rawMatrix = [
      ['el-tree-node__content', 'a'],
      ['el-tree-node__expand-icon', 'b']
    ]
    const newClassMap = rawMatrix.reduce<typeof classGenerator.newClassMap>((acc, [key, name]) => {
      acc[key] = {
        name,
        usedBy: []
      }
      return acc
    }, {})
    classGenerator.newClassMap = newClassMap
    classGenerator.newClassSize = rawMatrix.length
    const result = styleHandler(testCase, {
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      isMainChunk: true,
      replaceUniversalSelectorWith: 'view',
      classGenerator
    })
    expect(result).toMatchSnapshot()
  })

  it('mangle-nested-with-comment', async () => {
    // const options = getOptions()
    const testCase = await getCase('mangle-nested-with-comment.css')
    const classGenerator = new ClassGenerator()
    const rawMatrix = [
      ['el-tree-node__content', 'a'],
      ['el-tree-node__expand-icon', 'b']
    ]
    const newClassMap = rawMatrix.reduce<typeof classGenerator.newClassMap>((acc, [key, name]) => {
      acc[key] = {
        name,
        usedBy: []
      }
      return acc
    }, {})
    classGenerator.newClassMap = newClassMap
    classGenerator.newClassSize = rawMatrix.length
    const result = styleHandler(testCase, {
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      isMainChunk: true,
      replaceUniversalSelectorWith: 'view',
      classGenerator
    })
    expect(result).toMatchSnapshot()
  })
})
