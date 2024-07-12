import { replaceWxml } from '@/wxml/shared'

describe('replaceWxml', () => {
  it('replaceWxml case 0', () => {
    expect(replaceWxml('-')).toBe('_-')
    expect(replaceWxml('-', { ignoreHead: true })).toBe('-')
  })
})
