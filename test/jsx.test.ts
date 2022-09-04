import { jsxHandler } from '@/jsx'
import { createReplacer } from '@/jsx/replacer'
import { jsxCasePath, createGetCase } from './util'

const getCase = createGetCase(jsxCasePath)

// const putCase = createPutCase(jsxCasePath)

describe('jsxHandler', () => {
  let reactReplacer: ReturnType<typeof createReplacer>
  let vue2Replacer: ReturnType<typeof createReplacer>
  let vue3Replacer: ReturnType<typeof createReplacer>
  beforeEach(() => {
    reactReplacer = createReplacer('react')
    vue2Replacer = createReplacer('vue')
    vue3Replacer = createReplacer('vue3')
  })
  it('case1 ', async () => {
    const item = await getCase('case1.js')
    const { code } = jsxHandler(item, reactReplacer)

    // await putCase('case1.result.js', result)

    expect(code).toMatchSnapshot()
  })

  it('case2 ', async () => {
    const item = await getCase('case2.js')
    const { code } = jsxHandler(item, reactReplacer)
    // await putCase('case2.result.js', result)

    expect(code).toMatchSnapshot()
  })

  it('case3 ', async () => {
    const item = await getCase('case3.js')
    const { code } = jsxHandler(item, reactReplacer)
    // await putCase('case3.result.js', result)

    expect(code).toMatchSnapshot()
  })

  it('react-hover-class', async () => {
    const item = await getCase('react-hover-class.js')
    const { code } = jsxHandler(item, reactReplacer)
    expect(code).toMatchSnapshot()
  })

  it('vue2-case1', async () => {
    const item = await getCase('vue2-case1.js')
    const { code } = jsxHandler(item, vue2Replacer)

    expect(code).toMatchSnapshot()
  })

  test('vue2-hover-class.js', async () => {
    const item = await getCase('vue2-hover-class.js')
    const { code } = jsxHandler(item, vue2Replacer)

    expect(code).toMatchSnapshot()
  })

  it('vue3-createStaticVNode.js', async () => {
    const item = await getCase('vue3-createStaticVNode.js')

    const { code } = jsxHandler(item, vue3Replacer)

    expect(code).toMatchSnapshot()
  })

  it('vue3-render.js', async () => {
    const item = await getCase('vue3-render.js')

    const { code } = jsxHandler(item, vue3Replacer)

    expect(code).toMatchSnapshot()
  })

  it('vue3-hover-class.js', async () => {
    const item = await getCase('vue3-hover-class.js')

    const { code } = jsxHandler(item, vue3Replacer)

    expect(code).toMatchSnapshot()
  })

  it('react-jsx-loader-case0', async () => {
    const item = await getCase('react-jsx-loader-case0.js')

    const { code } = jsxHandler(item, reactReplacer)

    expect(code).toMatchSnapshot()
  })

  it('react-jsx-loader-case1', async () => {
    const item = await getCase('react-jsx-loader-case1.js')

    const { code } = jsxHandler(item, reactReplacer)

    expect(code).toMatchSnapshot()
  })

  it('react-jsx-loader-case-with-vars', async () => {
    const item = await getCase('react-jsx-loader-case-with-vars.js')

    const { code } = jsxHandler(item, reactReplacer)

    expect(code).toMatchSnapshot()
  })

  // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/53
  // it('multiple file no end issue', () => {

  // })
})
