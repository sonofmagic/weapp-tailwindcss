import { LRUCache } from 'lru-cache'
import { sources } from 'webpack'
import { createCache } from '@/cache'

describe('cache', () => {
  let ctx: ReturnType<typeof createCache>
  beforeEach(() => {
    ctx = createCache()
  })

  it('exposes basic utils', () => {
    expect(ctx).toBeDefined()
    expect(ctx.hashMap instanceof Map).toBe(true)
    expect(ctx.instance instanceof LRUCache).toBe(true)
    expect(typeof ctx.process).toBe('function')
  })

  it('hash map hasHashKey, getHashValue and setHashValue', () => {
    expect(ctx.hashMap.size).toBe(0)
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
    expect(ctx.hashMap.size).toBe(2)
    expect(ctx.getHashValue('0')).toBeUndefined()
    expect(ctx.getHashValue(1)).toEqual(a)
    expect(ctx.getHashValue('2')).toEqual(b)
    expect(ctx.hasHashKey('cc')).toBe(false)
    expect(ctx.hasHashKey(1)).toBe(true)
    expect(ctx.hasHashKey('2')).toBe(true)
  })

  it('cache instance basic accessors', () => {
    expect(ctx.instance.size).toBe(0)
    expect(ctx.get('1')).toBeUndefined()
    expect(ctx.has('1')).toBe(false)
    ctx.set('2', '2')
    expect(ctx.instance.size).toBe(1)
    expect(ctx.has('2')).toBe(true)
    expect(ctx.get('2')).toBe('2')
    ctx.set('3', new sources.ConcatSource('3'))
    const s = ctx.get('3')
    expect(s instanceof sources.ConcatSource).toBe(true)
    expect(s?.source().toString()).toBe('3')
  })

  it('cache calcHashValueChanged updates change flag', () => {
    ctx.calcHashValueChanged('1', '1')
    let v = ctx.getHashValue('1')
    expect(v).toEqual({
      hash: '1',
      changed: true,
    })

    ctx.calcHashValueChanged('1', '1')
    v = ctx.getHashValue('1')
    expect(v).toEqual({
      hash: '1',
      changed: false,
    })

    ctx.calcHashValueChanged('1', '2')
    v = ctx.getHashValue('1')
    expect(v).toEqual({
      hash: '2',
      changed: true,
    })
  })

  it('process executes transform and caches result when no hit', async () => {
    const calls: string[] = []
    const result = await ctx.process<string>({
      key: 'a',
      rawSource: 'source',
      async transform() {
        calls.push('transform')
        return 'handled'
      },
    })
    expect(result).toBe('handled')
    expect(calls).toEqual(['transform'])
    expect(ctx.get('a')).toBe('handled')
  })

  it('process reuses cached value when hash unchanged', async () => {
    const calls: string[] = []

    await ctx.process<string>({
      key: 'a',
      rawSource: 'same',
      async transform() {
        calls.push('first')
        return 'value'
      },
    })

    const result = await ctx.process<string>({
      key: 'a',
      rawSource: 'same',
      async onCacheHit(value) {
        calls.push(`hit:${value}`)
      },
      async transform() {
        calls.push('second')
        return 'should-not-run'
      },
    })

    expect(result).toBe('value')
    expect(calls).toEqual(['first', 'hit:value'])
  })

  it('process supports custom cacheValue', async () => {
    const raw = 'css'
    const cacheValue = new sources.ConcatSource(raw)
    await ctx.process<string>({
      key: 'style',
      rawSource: raw,
      async transform() {
        return {
          result: raw,
          cacheValue,
        }
      },
    })
    expect(ctx.get('style')).toBe(cacheValue)
  })

  it('disabled cache skips storing and behaves as pass-through', async () => {
    const disabled = createCache(false)
    const result = await disabled.process<string>({
      key: 'noop',
      rawSource: 'no-cache',
      async transform() {
        return 'value'
      },
    })
    expect(result).toBe('value')
    expect(disabled.has('noop')).toBe(false)
  })
})
