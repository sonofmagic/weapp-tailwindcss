import { MappingChars2StringEntries } from '@/dic'
describe('dic test', () => {
  it('check duplicate', () => {
    const set = new Set()
    let invalid = false
    for (const [, value] of MappingChars2StringEntries) {
      if (set.has(value)) {
        invalid = true
        console.log(`duplicate value: ${value} !`)
        break
      } else {
        set.add(value)
      }
    }
    expect(invalid).toBe(false)
  })
})
