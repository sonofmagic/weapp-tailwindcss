import { greet, VERSION } from '@/index'

describe('tsdown template', () => {
  it('greets with provided name', () => {
    expect(greet('world')).toBe('hello world')
  })

  it('exposes version placeholder', () => {
    expect(VERSION).toBe('0.0.0')
  })
})
