import { createTailwindMerge, getDefaultConfig, twMerge } from '@/index'

describe('index', () => {
  it('foo bar', () => {
    expect(twMerge('p-1 p-2 p-0.5')).toBe('p-0d5')
  })

  it('foo bar case 0', () => {
    const twMerge = createTailwindMerge(getDefaultConfig)
    expect(twMerge('p-1 p-2 p-0.5')).toBe('p-0d5')
  })
})
