import { twMerge } from '@/index'

describe('index', () => {
  it('foo bar', () => {
    expect(twMerge('p-1 p-2 p-0.5')).toBe('p-0d5')
  })
})
