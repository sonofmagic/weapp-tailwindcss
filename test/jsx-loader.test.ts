import { jsxHandler } from '@/jsx'

import { loaderCasePath, createGetCase } from './util'
import { createReplacer } from '@/jsx/replacer'

const getCase = createGetCase(loaderCasePath + '/taro-vue3-app')
// const putCase = createPutCase(jsxCasePath)

describe('jsxHandler', () => {
  // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/53
  it('multiple file no end issue', async () => {
    const code = await getCase('First.tsx.snap')
    const result = jsxHandler(code, createReplacer('vue3'))
    expect(result).toMatchSnapshot()
  })
})
