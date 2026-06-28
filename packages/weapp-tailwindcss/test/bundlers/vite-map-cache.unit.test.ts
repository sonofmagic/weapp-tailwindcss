import { describe, expect, it, vi } from 'vitest'
import { pruneMapToMaxSize, touchMapEntry } from '@/bundlers/vite/map-cache'

describe('vite map cache helpers', () => {
  it('refreshes entry insertion order', () => {
    const cache = new Map<string, number>([
      ['a', 1],
      ['b', 2],
    ])

    touchMapEntry(cache, 'a', 3)

    expect([...cache.entries()]).toEqual([
      ['b', 2],
      ['a', 3],
    ])
  })

  it('prunes oldest entries and stops on empty iterators', () => {
    const cache = new Map<string, number>([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ])
    const onDelete = vi.fn()

    pruneMapToMaxSize(cache, 1, onDelete)

    expect([...cache.entries()]).toEqual([['c', 3]])
    expect(onDelete).toHaveBeenCalledTimes(2)
    expect(onDelete).toHaveBeenNthCalledWith(1, 'a')
    expect(onDelete).toHaveBeenNthCalledWith(2, 'b')

    pruneMapToMaxSize(cache, 2, onDelete)
    expect(cache.size).toBe(1)
  })

  it('stops pruning when a map-like key iterator yields no key', () => {
    const cache = {
      delete: vi.fn(),
      keys: () => ({
        next: () => ({ value: undefined }),
      }),
      size: 1,
    } as unknown as Map<string, number>
    const onDelete = vi.fn()

    pruneMapToMaxSize(cache, 0, onDelete)

    expect(cache.delete).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })
})
