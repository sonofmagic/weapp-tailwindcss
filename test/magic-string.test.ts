import MagicString from 'magic-string'

describe('MagicString', () => {
  it('default', () => {
    const s = new MagicString('problems = 99')

    s.update(0, 8, 'answer')
    expect(s.toString()).toBe('answer = 99') //
    s.update(0, 8, 'xxx')
    expect(s.toString()).toBe('xxx = 99') //
    s.update(11, 13, '42')
    expect(s.toString()).toBe('xxx = 42') //
  })
})
