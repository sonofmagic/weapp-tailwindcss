import type { InternalUserDefinedOptions } from '@/types'
import path from 'node:path'
import { getGroupedEntries, groupBy, regExpTest } from '@/utils'
import { switch2relative } from './util'

function xxx(fn: any) {
  const a1 = typeof fn !== 'function'
  const a2 = Function.prototype.toString.call(fn).indexOf('function')
  return {
    a1,
    a2,
  }
}

describe('test util', () => {
  it('fn type', () => {
    function x() {}
    async function ax() {}
    const arx = () => {}
    const aarx = async () => {}
    let res = xxx(x)
    expect(res).toEqual({
      a1: false,
      a2: 0,
    })
    res = xxx(ax)
    expect(res).toEqual({
      a1: false,
      a2: 6,
    })
    res = xxx(arx)
    expect(res).toEqual({
      a1: false,
      a2: -1,
    })
    res = xxx(aarx)
    expect(res).toEqual({
      a1: false,
      a2: -1,
    })
  })
  it('switch2relative', () => {
    const str = switch2relative(path.resolve(__dirname, './fixtures/vite'))
    expect(path.normalize(str).replaceAll('\\', '/')).toBe('fixtures/vite')
  })

  it('regExpTest throw case0', () => {
    expect(() => {
      // @ts-ignore
      regExpTest({}, 'a')
    }).toThrow()
  })

  it('regExpTest string case0', () => {
    expect(regExpTest(['a', 'b'], 'a')).toBe(true)
    expect(regExpTest(['a', 'b'], 'c')).toBe(false)
  })

  it('regExpTest regex case0', () => {
    expect(regExpTest([/a/, /b/], 'abcde')).toBe(true)
    expect(regExpTest([/a/, /b/], 'c')).toBe(false)
  })

  it('regExpTest both regex and string case0', () => {
    expect(regExpTest([/abc/, 'ee'], 'abcde')).toBe(true)
    expect(regExpTest(['ee', /yyy/], 'abcdee')).toBe(true)
    expect(regExpTest(['ee', /yyy/], 'abcdyy')).toBe(false)
  })

  it('groupBy throw error case', () => {
    expect(() => {
      // @ts-ignore
      groupBy({}, x => x.name)
    }).toThrow()

    expect(() => {
      // @ts-ignore
      groupBy([], [])
    }).toThrow()
  })

  it('groupBy case0', () => {
    const res = groupBy(
      [
        {
          name: 'a',
          price: 1,
        },
        {
          name: 'a',
          price: 2,
        },
        {
          name: 'a',
          price: 3,
        },
        {
          name: 'b',
          price: 30,
        },
      ],
      x => x.name,
    )

    expect(res).toEqual({
      a: [
        {
          name: 'a',
          price: 1,
        },
        {
          name: 'a',
          price: 2,
        },
        {
          name: 'a',
          price: 3,
        },
      ],
      b: [
        {
          name: 'b',
          price: 30,
        },
      ],
    })
  })

  describe('getGroupedEntries', () => {
    const matchers = {
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      htmlMatcher: (file: string) => file.endsWith('.wxml'),
      jsMatcher: (file: string) => file.endsWith('.js'),
      wxsMatcher: (file: string) => file.endsWith('.wxs'),
    } as Pick<InternalUserDefinedOptions, 'cssMatcher' | 'htmlMatcher' | 'jsMatcher' | 'wxsMatcher'>

    const options = matchers as unknown as InternalUserDefinedOptions

    it('groups entries by matcher priority', () => {
      const entries: [string, number][] = [
        ['app.wxss', 1],
        ['index.wxml', 2],
        ['logic.js', 3],
        ['helper.wxs', 4],
        ['README.md', 5],
      ]

      expect(getGroupedEntries(entries, options)).toEqual({
        css: [['app.wxss', 1]],
        html: [['index.wxml', 2]],
        js: [
          ['logic.js', 3],
          ['helper.wxs', 4],
        ],
        other: [['README.md', 5]],
      })
    })

    it('returns empty arrays for missing groups', () => {
      const entries: [string, number][] = []

      expect(getGroupedEntries(entries, options)).toEqual({
        css: [],
        html: [],
        js: [],
        other: [],
      })
    })
  })
})
