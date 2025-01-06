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

it('merges tailwind classes with important modifier correctly', () => {
  expect(twMerge('!font-medium !font-bold')).toBe('!font-bold')
  expect(twMerge('!font-medium !font-bold font-thin')).toBe('!font-bold font-thin')
  expect(twMerge('!right-2 !-inset-x-px')).toBe('!-inset-x-px')
  expect(twMerge('focus:!inline focus:!block')).toBe('focus:!block')
})
