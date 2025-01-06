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

it('does not alter non-tailwind classes', () => {
  expect(twMerge('non-tailwind-class inline block')).toBe('non-tailwind-class block')
  expect(twMerge('inline block inline-1')).toBe('block inline-1')
  expect(twMerge('inline block i-inline')).toBe('block i-inline')
  expect(twMerge('focus:inline focus:block focus:inline-1')).toBe('focus:block focus:inline-1')
})
