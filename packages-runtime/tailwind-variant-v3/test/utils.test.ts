import { describe, expect, it } from 'vitest'

import { falsyToString } from '../src/utils.js'
import './matchers'

describe('falsyToString', () => {
  it('should return a string when given a boolean', () => {
    expect(falsyToString(true)).toBe('true')
    expect(falsyToString(false)).toBe('false')
  })

  it('should return 0 when given 0', () => {
    expect(falsyToString(0)).toBe('0')
  })

  it('should return the original value when given a value other than 0 or a boolean', () => {
    expect(falsyToString('test')).toBe('test')
    expect(falsyToString(4)).toBe(4)
    expect(falsyToString(null)).toBe(null)
  })
})
