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

it('handles color conflicts properly', () => {
  expect(twMerge('bg-grey-5 bg-hotpink')).toBe('bg-hotpink')
  expect(twMerge('hover:bg-grey-5 hover:bg-hotpink')).toBe('hover:bg-hotpink')
  expect(twMerge('stroke-[hsl(350_80%_0%)] stroke-[10px]')).toBe(
    'stroke-[hsl(350_80%_0%)] stroke-[10px]',
  )
})
