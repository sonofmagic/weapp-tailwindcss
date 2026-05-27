import { replaceWxml } from '@/wxml/shared'
import { arbitraryValuesMap } from './arbitraryValuesMap'

const wxmlAllowClassCharsRegExp = /^[\w-]*$/

describe('all arbitrary values usages', () => {
  describe.each(Object.entries(arbitraryValuesMap))('%s', (title, subTitleObj) => {
    it.each(Object.entries(subTitleObj))('%s', (subTitle, testCases) => {
      for (const testCase of testCases) {
        const res = replaceWxml(testCase)
        const valid = wxmlAllowClassCharsRegExp.test(res)
        expect(valid).toBe(true)
        expect(res).toMatchSnapshot()
      }
    })
  })
})
