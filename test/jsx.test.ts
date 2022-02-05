import fs from 'fs/promises'
import path from 'path'
import { jsxHandler } from '../src/jsx/index'

const jsxCasePath = path.resolve(__dirname, 'fixtures/jsx')

function resolve (...args: string[]) {
  return path.resolve(jsxCasePath, ...args)
}

async function getCase (casename: string) {
  return await fs.readFile(resolve(casename), {
    encoding: 'utf-8'
  })
}
describe('first', () => {
  it('case1 ', async () => {
    const item = await getCase('case1.js')
    const result = jsxHandler(item)
    console.log(result)
  })

  it('case2 ', async () => {
    const item = await getCase('case2.js')
    const result = jsxHandler(item)
    console.log(result)
  })

  it('case3 ', async () => {
    const item = await getCase('case3.js')
    const result = jsxHandler(item)
    console.log(result)
  })
})
