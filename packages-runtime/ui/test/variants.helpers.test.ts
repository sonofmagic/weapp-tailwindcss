import { afterEach, describe, expect, it, vi } from 'vitest'

describe('variant helpers', () => {
  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unmock('tailwind-variants')
    vi.unmock('tailwind-merge')
  })

  it('returns non-string outputs without merging', async () => {
    const mergeSpy = vi.fn()

    vi.doMock('tailwind-variants', () => ({
      __esModule: true,
      createTV: () => () => () => undefined,
    }))
    vi.doMock('tailwind-merge', () => ({
      __esModule: true,
      twMerge: mergeSpy,
    }))

    const { button } = await import('../src/variants')

    expect(button()).toBeUndefined()
    expect(mergeSpy).not.toHaveBeenCalled()
  })
})
