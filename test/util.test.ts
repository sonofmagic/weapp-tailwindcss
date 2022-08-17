import { switch2relative } from './util'
import path from 'path'

describe('test util', () => {
  it('switch2relative', () => {
    const str = switch2relative(path.resolve(__dirname, './fixtures/vite'))
    expect(path.normalize(str)).toBe('fixtures\\vite')
  })
})
