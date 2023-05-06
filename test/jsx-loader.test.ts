import { jsxHandler } from '#test/archived/jsx/v1'
import { jsxHandler as newJsxHandler } from '@/jsx/v2'
import { loaderCasePath, createGetCase } from './util'
import { createReplacer } from '#test/archived/jsx/replacer'
import { getOptions } from '@/options'
const getReactCase = createGetCase(loaderCasePath + '/taro-app')
const getVue3Case = createGetCase(loaderCasePath + '/taro-vue3-app')
const getVue2Case = createGetCase(loaderCasePath + '/taro-vue2-app')
const getReactCustomAttrsCase = createGetCase(loaderCasePath + '/taro-custom-attrs')
// const putCase = createPutCase(jsxCasePath)

describe('jsx-loader handler', () => {
  // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/53
  it('vue3 jsx normal case', async () => {
    const code = await getVue3Case('First.tsx.tmp')
    const result = jsxHandler(code, createReplacer('vue3'))
    expect(result).toMatchSnapshot()
  })

  it('new vue3 jsx normal case', async () => {
    const code = await getVue3Case('First.tsx.tmp')
    const result = newJsxHandler(code, {
      framework: 'vue3'
    })
    const result2 = jsxHandler(code, createReplacer('vue3'))
    expect(result).toStrictEqual(result2)
    expect(result).toMatchSnapshot()
  })

  it('new vue2 jsx normal case', async () => {
    const code = await getVue2Case('render.tsx.tmp')
    const result = newJsxHandler(code, {
      framework: 'vue2'
    })
    expect(result).toMatchSnapshot()
  })

  it('new react jsx normal case 0', async () => {
    const code = await getReactCase('arbitraryVariants.tsx.tmp')
    const result = newJsxHandler(code)
    expect(result).toMatchSnapshot()
  })

  it('new react jsx normal case 1', async () => {
    const code = await getReactCase('before.tsx.tmp')
    const result = newJsxHandler(code)
    expect(result).toMatchSnapshot()
  })

  it('new react jsx normal case 2', async () => {
    const code = await getReactCase('endClassCom.tsx.tmp')
    const result = newJsxHandler(code)
    expect(result).toMatchSnapshot()
  })

  it('custom attrs emptyImageClass transform case 0', async () => {
    const { jsxHandler } = getOptions(
      {
        customAttributes: {
          '*': ['emptyImageClass']
        },
        customReplaceDictionary: 'complex'
      },
      ['jsx']
    )
    const code = await getReactCustomAttrsCase('index.tsx.tmp')
    const result = jsxHandler(code)
    expect(result).toMatchSnapshot()
  })
})
