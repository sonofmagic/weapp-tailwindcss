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

it('handles negative value conflicts correctly', () => {
  expect(twMerge('-m-2 -m-5')).toBe('-m-5')
  expect(twMerge('-top-12 -top-2000')).toBe('-top-2000')
})

it('handles conflicts between positive and negative values correctly', () => {
  expect(twMerge('-m-2 m-auto')).toBe('m-auto')
  expect(twMerge('top-12 -top-69')).toBe('-top-69')
})

it('handles conflicts across groups with negative values correctly', () => {
  expect(twMerge('-right-1 inset-x-1')).toBe('inset-x-1')
  expect(twMerge('hover:focus:-right-1 focus:hover:inset-x-1')).toBe('focus:hover:inset-x-1')
})
