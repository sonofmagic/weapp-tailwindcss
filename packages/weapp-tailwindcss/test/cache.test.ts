import { sources } from 'webpack'
import { LRUCache } from 'lru-cache'
import { createCache } from '@/cache'

describe('cache', () => {
  let ctx: ReturnType<typeof createCache>
  beforeEach(() => {
    ctx = createCache()
  })

  it('toBeDefined', () => {
    expect(ctx).toBeDefined()
    expect(ctx.calcHashValueChanged).toBeDefined()
    expect(ctx.computeHash).toBeDefined()
    expect(ctx.get).toBeDefined()
    expect(ctx.getHashValue).toBeDefined()
    expect(ctx.has).toBeDefined()
    expect(ctx.hasHashKey).toBeDefined()
    expect(ctx.hashMap).toBeDefined()
    expect(ctx.hashMap instanceof Map).toBe(true)
    expect(ctx.instance).toBeDefined()
    expect(ctx.instance instanceof LRUCache).toBe(true)
    expect(ctx.process).toBeDefined()
    expect(ctx.set).toBeDefined()
    expect(ctx.setHashValue).toBeDefined()
  })

  it('hash map hasHashKey, getHashValue and setHashValues', () => {
    expect(ctx.hashMap.size === 0).toBe(true)
    const a = {
      changed: false,
      hash: '1',
    }
    ctx.setHashValue(1, a)
    const b = {
      changed: false,
      hash: '2',
    }
    ctx.setHashValue('2', b)
    expect(ctx.hashMap.size === 2).toBe(true)
    expect(ctx.getHashValue('0')).toBe(undefined)
    expect(ctx.getHashValue(1)).toEqual(a)
    expect(ctx.getHashValue('2')).toEqual(b)
    expect(ctx.hasHashKey('cc')).toBe(false)
    expect(ctx.hasHashKey(1)).toBe(true)
    expect(ctx.hasHashKey('2')).toBe(true)
  })

  it('cache instance', () => {
    expect(ctx.instance.size === 0).toBe(true)

    expect(ctx.get('1')).toBe(undefined)
    expect(ctx.has('1')).toBe(false)
    expect(ctx.set('2', '2') instanceof LRUCache).toBe(true)
    expect(ctx.instance.size === 1).toBe(true)
    expect(ctx.has('2')).toBe(true)
    expect(ctx.get('2')).toBe('2')
    ctx.set('3', new sources.ConcatSource('3'))
    const s = ctx.get('3')
    expect(s instanceof sources.ConcatSource).toBe(true)
    expect(s?.source().toString()).toBe('3')
  })

  it('cache calcHashValueChanged', () => {
    ctx.calcHashValueChanged('1', '1')
    let v = ctx.getHashValue('1')
    expect(v).toBeDefined()
    expect(v).toEqual({
      hash: '1',
      changed: true,
    })

    ctx.calcHashValueChanged('1', '1')
    v = ctx.getHashValue('1')
    expect(v).toBeDefined()
    expect(v).toEqual({
      hash: '1',
      changed: false,
    })

    ctx.calcHashValueChanged('1', '2')
    v = ctx.getHashValue('1')
    expect(v).toBeDefined()
    expect(v).toEqual({
      hash: '2',
      changed: true,
    })
  })

  it('cache process case 0', () => {
    const arr: number[] = []
    ctx.process(
      '1',
      () => {
        arr.push(0)
      },
      () => {
        arr.push(1)
      },
    )
    expect(arr.length).toBe(1)
    expect(arr).toEqual([1])
  })

  it('cache process case 1', () => {
    const arr: number[] = []
    ctx.process(
      '1',
      () => {
        arr.push(0)
        return false
      },
      () => {
        arr.push(1)
      },
    )
    expect(arr.length).toBe(1)
    expect(arr).toEqual([1])
  })

  it('cache process case 2', () => {
    const arr: number[] = []

    ctx.setHashValue('1', {
      changed: false,
      hash: '2',
    })

    ctx.process(
      '1',
      () => {
        arr.push(0)
      },
      () => {
        arr.push(1)
      },
    )
    expect(arr.length).toBe(1)
    expect(arr).toEqual([0])
  })

  it('cache process case 3', async () => {
    const arr: number[] = []

    ctx.setHashValue('1', {
      changed: false,
      hash: '2',
    })

    await ctx.process(
      '1',
      () => {
        arr.push(0)
        return false
      },
      () => {
        arr.push(1)
      },
    )
    expect(arr.length).toBe(2)
    expect(arr).toEqual([0, 1])
  })

  it('cache process case 4', async () => {
    const arr: number[] = []

    ctx.setHashValue('1', {
      changed: false,
      hash: '2',
    })

    await ctx.process(
      '1',
      () => {
        arr.push(0)
        return false
      },
      () => {
        arr.push(1)
        return {
          key: '2',
          source: '2',
        }
      },
    )
    expect(arr.length).toBe(2)
    expect(arr).toEqual([0, 1])
    expect(ctx.instance.size).toBe(1)
  })
})
