import { jsxHandler } from '@/jsx'
import { createReplacer } from '@/jsx/replacer'
import { jsxCasePath, createGetCase } from './util'

const getCase = createGetCase(jsxCasePath)

// const putCase = createPutCase(jsxCasePath)

const reactReplacer = createReplacer('react')
const vue2Replacer = createReplacer('vue')

describe('jsxHandler', () => {
  it('case1 ', async () => {
    const item = await getCase('case1.js')
    const result = jsxHandler(item, reactReplacer)

    // await putCase('case1.result.js', result)
    const expected = await getCase('case1.result.js')
    expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('case2 ', async () => {
    const item = await getCase('case2.js')
    const result = jsxHandler(item, reactReplacer)
    // await putCase('case2.result.js', result)
    const expected = await getCase('case2.result.js')
    expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('case3 ', async () => {
    const item = await getCase('case3.js')
    const result = jsxHandler(item, reactReplacer)
    // await putCase('case3.result.js', result)
    const expected = await getCase('case3.result.js')
    expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('vue2-case1', async () => {
    const item = await getCase('vue2-case1.js')
    const result = jsxHandler(item, vue2Replacer)
    const expected = await getCase('vue2-case1.result.js')
    // await putCase('vue2-case1.result.js', result)
    expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('vue3-createStaticVNode.js', async () => {
    const item = await getCase('vue3-createStaticVNode.js')
    const vue3Replacer = createReplacer('vue3')
    const result = jsxHandler(item, vue3Replacer)
    const expected = await getCase('vue3-createStaticVNode.result.js')
    // await putCase('vue3-createStaticVNode.result.js', result)
    expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('vue3-render.js', async () => {
    const item = await getCase('vue3-render.js')
    const vue3Replacer = createReplacer('vue3')
    const result = jsxHandler(item, vue3Replacer)
    const expected = await getCase('vue3-render.result.js')
    // await putCase('vue3-render.result.js', result)
    // expect(result).toBe(true)
    expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })
})
