import { expect, it } from 'vitest'

import { replaceJs, twMergeReplaceJs as twMerge } from './utils'

expect.extend({
  toBe: (received, expected) => {
    const target = replaceJs(expected)
    if (received !== target) {
      return {
        message: () => `expected ${received} to be ${target}`,
        pass: false,
      }
    }
    else {
      return {
        message: () => ``,
        pass: true,
      }
    }
  },
})

it('merges non-conflicting classes correctly', () => {
  expect(twMerge('border-t border-white/10')).toBe('border-t border-white/10')
  expect(twMerge('border-t border-white')).toBe('border-t border-white')
  // expect(cn('text-3.5xl text-black')).toEqual('text-3.5xl text-black')
  expect(twMerge('text-3.5xl text-black')).toBe('text-3.5xl text-black')
})
