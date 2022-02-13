import { jsxHandler } from '../src/jsx/index'
// @ts-ignore
import { jsxCasePath, readFile, resolve, writeFile } from './util'

function getCase (casename: string) {
  return readFile(resolve(jsxCasePath, casename))
}

export function putCase (casename: string, data: string) {
  return writeFile(resolve(jsxCasePath, casename), data)
}
describe('first', () => {
  it('case1 ', async () => {
    const item = await getCase('case1.js')
    const result = jsxHandler(item)

    // await putCase('case1.result.js', result)
    const expected = await getCase('case1.result.js')
    expect(result).toBe(expected)
  })

  it('case2 ', async () => {
    const item = await getCase('case2.js')
    const result = jsxHandler(item)
    // await putCase('case2.result.js', result)
    const expected = await getCase('case2.result.js')
    expect(result).toBe(expected)
  })

  it('case3 ', async () => {
    const item = await getCase('case3.js')
    const result = jsxHandler(item)
    // await putCase('case3.result.js', result)
    const expected = await getCase('case3.result.js')
    expect(result).toBe(expected)
  })

  it('vue2-case1', async () => {
    const item = await getCase('vue2-case1.js')
    const result = jsxHandler(item)
    const expected = await getCase('vue2-case1.result.js')
    // await putCase('vue2-case1.result.js', result)
    expect(result).toBe(expected)
  })
})
