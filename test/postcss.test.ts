import { styleHandler } from '../src/postcss/index'
import { cssCasePath, readFile, resolve } from './util'

function getCase (casename: string) {
  return readFile(resolve(cssCasePath, casename))
}
describe('first', () => {
  it('css @media case', async () => {
    const testCase = await getCase('media1.css')
    const result = styleHandler(testCase)
    expect(result).toBe(
      '@media (min-width: 640px) {\n  .sm_c_text-3xl {\n    font-size: 60rpx;\n    line-height: 72rpx;\n  }\n}\n'
    )
  })
})
