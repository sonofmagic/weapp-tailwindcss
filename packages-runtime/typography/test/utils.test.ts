/* eslint-disable ts/no-require-imports */
const utils = require('../src/utils')

describe('typography utils', () => {
  it('detects usable palette entries', () => {
    expect(utils.isUsableColor('red', { 600: '#f00' })).toBe('#f00')
    expect(utils.isUsableColor('gray', { 600: '#ccc' })).toBe(false)
    expect(utils.isUsableColor('blue', {})).toBeUndefined()
  })

  it('extracts common trailing pseudos', () => {
    expect(utils.commonTrailingPseudos('a::before')).toEqual(['::before', 'a'])
    expect(utils.commonTrailingPseudos('a::before,b::before')).toEqual(['::before', 'a,b'])
    expect(utils.commonTrailingPseudos('a::before,b::after')).toEqual([null, 'a::before,b::after'])
    expect(utils.commonTrailingPseudos('a::before::after')).toEqual(['::before::after', 'a'])
  })
})
