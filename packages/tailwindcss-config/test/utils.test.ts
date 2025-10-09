import { describe, expect, it } from 'vitest'
import { defuOverrideArray } from '@/utils'

describe('utils', () => {
  it('defuOverrideArray replaces arrays while respecting fallback values', () => {
    const defaults = {
      content: ['src/**/*.{js,ts}'],
      nested: {
        extensions: ['.js'],
      },
      number: 1,
    }

    const overrides = {
      content: ['pages/**/*.{vue}'],
      nested: {
        extensions: ['.ts'],
      },
    }

    const merged = defuOverrideArray(overrides, defaults)

    expect(merged.content).toEqual(['pages/**/*.{vue}'])
    expect(merged.nested.extensions).toEqual(['.ts'])
    expect(merged.number).toBe(1)

    const fallbackOnly = defuOverrideArray({}, defaults)
    expect(fallbackOnly.content).toEqual(['src/**/*.{js,ts}'])
    expect(fallbackOnly.nested.extensions).toEqual(['.js'])
    expect(fallbackOnly.number).toBe(1)
  })
})
