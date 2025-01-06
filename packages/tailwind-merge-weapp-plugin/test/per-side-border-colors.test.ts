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

it('merges classes with per-side border colors correctly', () => {
  expect(twMerge('border-t-some-blue border-t-other-blue')).toBe('border-t-other-blue')
  expect(twMerge('border-t-some-blue border-some-blue')).toBe('border-some-blue')
  expect(twMerge('border-some-blue border-s-some-blue')).toBe('border-some-blue border-s-some-blue')
  expect(twMerge('border-e-some-blue border-some-blue')).toBe('border-some-blue')
})
