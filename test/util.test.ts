import path from 'node:path'
import { switch2relative } from './util'

describe('test util', () => {
  it('switch2relative', () => {
    const str = switch2relative(path.resolve(__dirname, './fixtures/vite'))
    expect(path.normalize(str).replaceAll('\\', '/')).toBe('fixtures/vite')
  })
})
