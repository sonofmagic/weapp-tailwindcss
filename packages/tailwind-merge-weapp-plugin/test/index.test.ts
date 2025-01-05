import { withWeapp } from '@/index'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge(withWeapp)

describe('index', () => {
  it('foo bar', () => {
    expect(twMerge('p-1 p-2 p-3')).toBe('p-3')
  })
})
