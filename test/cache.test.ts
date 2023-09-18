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
      hash: '1'
    }
    ctx.setHashValue(1, a)
    const b = {
      changed: false,
      hash: '2'
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
  })
})
