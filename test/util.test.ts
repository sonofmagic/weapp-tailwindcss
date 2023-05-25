import path from 'node:path'
import { switch2relative } from './util'
import { regExpTest, groupBy } from '@/utils'

describe('test util', () => {
  it('switch2relative', () => {
    const str = switch2relative(path.resolve(__dirname, './fixtures/vite'))
    expect(path.normalize(str).replaceAll('\\', '/')).toBe('fixtures/vite')
  })

  it('regExpTest throw case0', () => {
    expect(() => {
      // @ts-ignore
      regExpTest({}, 'a')
    }).toThrow()
  });

  it('regExpTest string case0', () => {
    expect(regExpTest(['a', 'b'], 'a')).toBe(true)
    expect(regExpTest(['a', 'b'], 'c')).toBe(false)
  });

  it('regExpTest regex case0', () => {
    expect(regExpTest([/a/, /b/], 'abcde')).toBe(true)
    expect(regExpTest([/a/, /b/], 'c')).toBe(false)
  });

  it('regExpTest both regex and string case0', () => {
    expect(regExpTest([/abc/, 'ee'], 'abcde')).toBe(true)
    expect(regExpTest(['ee', /yyy/], 'abcdee')).toBe(true)
    expect(regExpTest(['ee', /yyy/], 'abcdyy')).toBe(false)
  });

  it('groupBy throw error case', () => {
    expect(() => {
      // @ts-ignore
      groupBy({}, (x) => x.name)
    }).toThrow()

    expect(() => {
      // @ts-ignore
      groupBy([], [])
    }).toThrow()
  });

  it('groupBy case0', () => {
    const res = groupBy([
      {
        name: 'a',
        price: 1
      },
      {
        name: 'a',
        price: 2
      },
      {
        name: 'a',
        price: 3
      },
      {
        name: 'b',
        price: 30
      }
    ], (x) => x.name)

    expect(res).toEqual({
      a: [
        {
          name: 'a',
          price: 1
        },
        {
          name: 'a',
          price: 2
        },
        {
          name: 'a',
          price: 3
        }
      ],
      b: [
        {
          name: 'b',
          price: 30
        }
      ]
    })
  });
})
