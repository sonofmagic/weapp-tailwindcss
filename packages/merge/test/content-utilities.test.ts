import { expect, it } from 'vitest'

import { twMerge } from '../src'

it('merges content utilities correctly', () => {
  expect(twMerge('content-[\'hello\'] content-[attr(data-content)]')).toBe(
    'content-[attr(data-content)]',
  )
})
