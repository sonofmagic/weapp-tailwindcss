import { describe, expect, it, vi } from 'vitest'
import { createRuntimeFactory } from '@/create-runtime'

describe('createRuntimeFactory', () => {
  it('wraps library helpers with escape/unescape transformers', () => {
    const twMergeImpl = vi.fn((value: string) => value)
    const twJoinImpl = vi.fn((value: string) => value)
    const extendRuntimeImpl = vi.fn((value: string) => value)
    const createRuntimeImpl = vi.fn((value: string) => value)
    const prepareValue = vi.fn((value: string) => ({
      value: `prepared:${value}`,
      metadata: 'meta-token',
    }))
    const restoreValue = vi.fn((value: string, metadata?: unknown) => {
      expect(metadata).toBe('meta-token')
      return value.replace('prepared:', 'restored:')
    })

    const extendTailwindMerge = vi.fn(() => extendRuntimeImpl)
    const createTailwindMerge = vi.fn(() => createRuntimeImpl)

    const createRuntime = createRuntimeFactory({
      version: 2,
      twMerge: twMergeImpl,
      twJoin: twJoinImpl,
      extendTailwindMerge,
      createTailwindMerge,
      prepareValue,
      restoreValue,
    })

    const runtime = createRuntime()

    expect(runtime.version).toBe(2)

    const merged = runtime.twMerge('text-_b_hececec_B')
    expect(prepareValue).toHaveBeenCalledWith('text-[#ececec]')
    expect(twMergeImpl).toHaveBeenCalledWith('prepared:text-[#ececec]')
    expect(restoreValue).toHaveBeenCalledWith('prepared:text-[#ececec]', 'meta-token')
    expect(merged).toBe('restored_ctext-_b_hececec_B')

    const joined = runtime.twJoin('text-_b_hececec_B')
    expect(twJoinImpl).toHaveBeenCalledWith('prepared:text-[#ececec]')
    expect(joined).toBe('restored_ctext-_b_hececec_B')

    const extended = runtime.extendTailwindMerge('custom')
    expect(extendTailwindMerge).toHaveBeenCalledWith('custom')
    const extendedResult = extended('text-_b_hececec_B')
    expect(extendRuntimeImpl).toHaveBeenCalledWith('prepared:text-[#ececec]')
    expect(extendedResult).toBe('restored_ctext-_b_hececec_B')

    const created = runtime.createTailwindMerge('foo')
    expect(createTailwindMerge).toHaveBeenCalledWith('foo')
    const createdResult = created('text-_b_hececec_B')
    expect(createRuntimeImpl).toHaveBeenCalledWith('prepared:text-[#ececec]')
    expect(createdResult).toBe('restored_ctext-_b_hececec_B')
  })

  it('respects transformer options passed to createRuntime', () => {
    const twMergeImpl = vi.fn((value: string) => value)

    const createRuntime = createRuntimeFactory({
      version: 3,
      twMerge: twMergeImpl,
      twJoin: twMergeImpl,
      extendTailwindMerge: vi.fn(() => twMergeImpl),
      createTailwindMerge: vi.fn(() => twMergeImpl),
    })

    const runtime = createRuntime({ escape: false })
    const merged = runtime.twMerge('text-_b_hececec_B')

    expect(twMergeImpl).toHaveBeenCalledWith('text-[#ececec]')
    expect(merged).toBe('text-[#ececec]')
  })

  it('accepts boolean escape/unescape options', () => {
    const twMergeImpl = vi.fn((value: string) => value)

    const createRuntime = createRuntimeFactory({
      version: 3,
      twMerge: twMergeImpl,
      twJoin: twMergeImpl,
      extendTailwindMerge: vi.fn(() => twMergeImpl),
      createTailwindMerge: vi.fn(() => twMergeImpl),
    })

    const runtime = createRuntime({ escape: true, unescape: true })
    const merged = runtime.twMerge('text-_b_hececec_B')

    expect(twMergeImpl).toHaveBeenCalledWith('text-[#ececec]')
    expect(merged).toBe('text-_b_hececec_B')
  })

  it('accepts plain string responses from prepareValue hooks', () => {
    const twMergeImpl = vi.fn((value: string) => value)
    const prepareValue = vi.fn((value: string) => `prepared:${value}`)
    const restoreValue = vi.fn((value: string, metadata?: unknown) => {
      expect(metadata).toBeUndefined()
      return value
    })

    const createRuntime = createRuntimeFactory({
      version: 3,
      twMerge: twMergeImpl,
      twJoin: twMergeImpl,
      extendTailwindMerge: vi.fn(() => twMergeImpl),
      createTailwindMerge: vi.fn(() => twMergeImpl),
      prepareValue,
      restoreValue,
    })

    const runtime = createRuntime()
    runtime.twMerge('foo')

    expect(prepareValue).toHaveBeenCalledWith('foo')
    expect(twMergeImpl).toHaveBeenCalledWith('prepared:foo')
  })
})
