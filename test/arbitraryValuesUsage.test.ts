import { arbitraryValuesMap } from './arbitraryValuesMap'
import { createWxmlAllowClassCharsRegExp } from '@/reg'
import { replaceWxml } from '@/wxml/shared'

describe('all arbitrary values usages', () => {
  describe.each(Object.entries(arbitraryValuesMap))('%s', (title, subTitleObj) => {
    test.each(Object.entries(subTitleObj))('%s', (subTitle, testCases) => {
      testCases.forEach((testCase) => {
        const res = replaceWxml(testCase)
        const valid = createWxmlAllowClassCharsRegExp().test(res)
        // if (valid === false) {
        //   console.log(title + ' ---> ' + subTitle)
        // }
        expect(valid).toBe(true)
        expect(res).toMatchSnapshot()
      })
    })
  })
})
