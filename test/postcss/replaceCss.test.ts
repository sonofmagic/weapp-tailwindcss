import { cssCasePath, createGetCase, createPutCase } from '../util'
import { replaceCss } from '@/replace'
const getCase = createGetCase(cssCasePath)
// @ts-ignore
// eslint-disable-next-line no-unused-vars
const putCase = createPutCase(cssCasePath)
// replaceCss is refacted
describe.skip('[postcss] replaceCss', () => {
  it('shadow arbitrary values 0', async () => {
    // eslint-disable-next-line no-octal-escape
    const testCase = await getCase('shadow-arbitrary-0.css')
    expect(replaceCss(testCase)).toBe('.shadow-_bl_0px_2px_11px_0px_rgba_pl_0_co_0_co_0_co_0_d_4_qr__br_{}')
  })

  it('shadow arbitrary values 1', async () => {
    const testCase = await getCase('shadow-arbitrary-1.css')
    expect(replaceCss(testCase)).toBe('.shadow-_bl_0px_2px_11px_0px__h_00000a_br_{}')
  })

  it("arbitrary before:content-['hello']", () => {
    const testCase = ".before\\:content-\\[\\'hello\\'\\]::before"
    const result = replaceCss(testCase)
    expect(result).toBe('.before_c_content-_bl__q_hello_q__br_::before')
  })

  it('arbitrary variants case 1', () => {
    const result = replaceCss('.\\[\\&_\\.u-count-down\\\\_\\\\_text\\]\\:\\!text-red-400 .u-count-down__text')
    expect(result).toBe('._bl__am___d_u-count-down_bs___bs__text_br__c__i_text-red-400 .u-count-down__text')
  })
})
