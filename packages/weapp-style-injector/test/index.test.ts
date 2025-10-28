import { bar, getDirname, xx } from '@/index'

describe('index', () => {
  it('foo bar', () => {
    expect(bar()).toBe('foo')
  })

  it('getDirname returns a directory path', () => {
    const dirname = getDirname()
    expect(typeof dirname).toBe('string')
    expect(dirname.length).toBeGreaterThan(0)
  })

  it('xx enum exposes numeric indices', () => {
    expect(xx.id).toBe(0)
    expect(xx.dd).toBe(1)
  })
})
