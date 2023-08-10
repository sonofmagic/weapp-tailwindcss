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

  it('throw error', () => {
    const s = new MagicString('problems = 99')
    //  Cannot overwrite a zero-length range – use appendLeft or prependRight instead
    // s.update(1, 1, 'a')
    // const r = s.toString()
    // console.log(r)
    // 所以必须要使用大于号
    expect(() => {
      s.update(1, 1, 'a')
      const r = s.toString()
      return r
    }).toThrow()
  })

  it('a to b', () => {
    const s = new MagicString("'a'")
    s.update(1, 2, 'b')
    expect(s.toString()).toBe("'b'")
  })
})
