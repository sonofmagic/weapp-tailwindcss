import fs from 'fs/promises'
import path from 'path'
import { jsxHandler } from '../src/jsx/index'
describe('first', () => {
  it('should ', async () => {
    const item = await fs.readFile(
      path.resolve(__dirname, 'fixtures/jsx/case1.js'),
      {
        encoding: 'utf-8'
      }
    )
    const result = jsxHandler(item)
    console.log(result)
  })
})
