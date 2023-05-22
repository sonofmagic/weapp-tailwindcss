import { arbitraryValuesMap } from './arbitraryValuesMap'
import { wxmlAllowClassCharsRegExp } from '@/reg'
import { replaceWxml } from '@/wxml/shared'

describe('all arbitrary values usages', () => {
  describe.each(Object.entries(arbitraryValuesMap))('%s', (title, subTitleObj) => {
    // beforeEach(() => {
    //   wxmlAllowClassCharsRegExp.lastIndex = 0
    // })
    test.each(Object.entries(subTitleObj))('%s', (subTitle, testCases) => {
      for (const testCase of testCases) {
        wxmlAllowClassCharsRegExp.lastIndex = 0
        const res = replaceWxml(testCase)
        const valid = wxmlAllowClassCharsRegExp.test(res)
        // if (valid === false) {
        //   console.log(title + ' ---> ' + subTitle)
        // }
        expect(valid).toBe(true)
        expect(res).toMatchSnapshot()
      }
    })
  })
})
