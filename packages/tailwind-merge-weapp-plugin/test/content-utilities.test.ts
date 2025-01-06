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

it('merges content utilities correctly', () => {
  expect(twMerge('content-[\'hello\'] content-[attr(data-content)]')).toBe(
    'content-[attr(data-content)]',
  )
})
