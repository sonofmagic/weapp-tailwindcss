import { expect, it } from 'vitest'

import { twMerge } from './utils'

it('does not alter non-tailwind classes', () => {
  expect(twMerge('non-tailwind-class inline block')).toBe('non-tailwind-class block')
  expect(twMerge('inline block inline-1')).toBe('block inline-1')
  expect(twMerge('inline block i-inline')).toBe('block i-inline')
  expect(twMerge('focus:inline focus:block focus:inline-1')).toBe('focus:block focus:inline-1')
})
