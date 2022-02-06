import { jsxHandler } from '../src/jsx/index'
// @ts-ignore
import { jsxCasePath, readFile, resolve } from './util'

function getCase (casename: string) {
  return readFile(resolve(jsxCasePath, casename))
}
describe('first', () => {
  it('case1 ', async () => {
    const item = await getCase('case1.js')
    const result = jsxHandler(item)
    expect(Boolean(result)).toBe(true)
  })

  it('case2 ', async () => {
    const item = await getCase('case2.js')
    const result = jsxHandler(item)
    expect(Boolean(result)).toBe(true)
  })

  it('case3 ', async () => {
    const item = await getCase('case3.js')
    const result = jsxHandler(item)
    expect(Boolean(result)).toBe(true)
  })
})
