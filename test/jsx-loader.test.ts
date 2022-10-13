import { jsxHandler } from '#test/archived/jsx/v1'
import { newJsxHandler } from '@/jsx/v2'
import { loaderCasePath, createGetCase } from './util'
import { createReplacer } from '#test/archived/jsx/replacer'

const getVue3Case = createGetCase(loaderCasePath + '/taro-vue3-app')
const getVue2Case = createGetCase(loaderCasePath + '/taro-vue2-app')
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
})
