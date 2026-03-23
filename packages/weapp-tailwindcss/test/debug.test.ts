import { afterEach, describe, expect, it, vi } from 'vitest'

describe('createDebug', () => {
  afterEach(() => {
    vi.resetModules()
    vi.doUnmock('debug')
  })

  it('exposes the underlying enabled state and preserves prefixed logging', async () => {
    const underlyingDebug = vi.fn() as ((formatter: string, ...args: unknown[]) => void) & { enabled: boolean }
    underlyingDebug.enabled = false

    vi.doMock('debug', () => ({
      default: vi.fn(() => underlyingDebug),
    }))

    const { createDebug } = await import('@/debug')
    const debug = createDebug('[js:handlers] ')

    expect(debug.enabled).toBe(false)

    underlyingDebug.enabled = true

    expect(debug.enabled).toBe(true)

    debug('runtimeSet size=%d', 3)

    expect(underlyingDebug).toHaveBeenCalledWith('[js:handlers] runtimeSet size=%d', 3)
  })
})
