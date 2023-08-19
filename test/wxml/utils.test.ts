import { isPropsMatch } from '@/wxml/utils'

describe('utils', () => {
  it('isPropsMatch', () => {
    expect(isPropsMatch('a', 'a')).toBe(true)
  })
})
