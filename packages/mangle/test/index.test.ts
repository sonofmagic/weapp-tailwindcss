import { ClassGenerator } from '@tailwindcss-mangle/shared'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMangleContextState, useMangleStore } from '@/core'

describe('mangle store', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates isolated context instances', () => {
    const first = createMangleContextState()
    const second = createMangleContextState()

    first.runtimeSet.add('foo')
    first.generatedNameCache.set('foo', 'a')

    expect(second.runtimeSet.size).toBe(0)
    expect(second.generatedNameCache.size).toBe(0)
  })

  it('reuses generated class names via cache', () => {
    const store = useMangleStore()
    const spy = vi.spyOn(ClassGenerator.prototype, 'generateClassName')

    store.initMangle({
      mangleClassFilter: () => true,
    })
    store.setMangleRuntimeSet(new Set(['foo']))

    const first = store.mangleContext.jsHandler('foo foo')
    expect(spy).toHaveBeenCalledTimes(1)
    const firstTokens = first.trim().split(/\s+/)
    expect(firstTokens[0]).toBe(firstTokens[1])

    const second = store.mangleContext.jsHandler('foo')
    expect(second).toBe(firstTokens[0])
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('resets context back to identity handlers', () => {
    const store = useMangleStore()
    store.initMangle({
      mangleClassFilter: () => true,
    })
    store.setMangleRuntimeSet(new Set(['foo']))

    const mangled = store.mangleContext.cssHandler('foo')
    expect(mangled).not.toBe('foo')

    store.resetMangle()

    expect(store.mangleContext.runtimeSet.size).toBe(0)
    expect(store.mangleContext.cssHandler('foo')).toBe('foo')
  })

  it('drops stale runtime entries when runtime set changes', () => {
    const store = useMangleStore()
    const spy = vi.spyOn(ClassGenerator.prototype, 'generateClassName')

    store.initMangle({
      mangleClassFilter: () => true,
    })
    store.setMangleRuntimeSet(new Set(['foo']))
    store.mangleContext.jsHandler('foo')
    expect(spy).toHaveBeenCalledTimes(1)

    store.setMangleRuntimeSet(new Set(['bar']))

    const result = store.mangleContext.jsHandler('foo bar')
    expect(result.includes('foo')).toBe(true)
    expect(result.includes('bar')).toBe(false)
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
