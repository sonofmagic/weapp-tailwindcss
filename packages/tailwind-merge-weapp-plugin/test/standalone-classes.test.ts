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

it('merges standalone classes from same group correctly', () => {
  expect(twMerge('inline block')).toBe('block')
  expect(twMerge('hover:block hover:inline')).toBe('hover:inline')
  expect(twMerge('hover:block hover:block')).toBe('hover:block')
  expect(twMerge('inline hover:inline focus:inline hover:block hover:focus:block')).toBe(
    'inline focus:inline hover:block hover:focus:block',
  )
  expect(twMerge('underline line-through')).toBe('line-through')
  expect(twMerge('line-through no-underline')).toBe('no-underline')
})
