import { styleHandler } from '../src/postcss/index'
import { cssCasePath, createGetCase, createPutCase } from './util'

const getCase = createGetCase(cssCasePath)
// @ts-ignore
// eslint-disable-next-line no-unused-vars
const putCase = createPutCase(cssCasePath)
describe('first', () => {
  it('css @media case', async () => {
    const testCase = await getCase('media1.css')
    const result = styleHandler(testCase)
    const expected = await getCase('media1.result.css')
    // await putCase('media1.result.css', result)
    expect(result).toBe(expected)
  })
})
