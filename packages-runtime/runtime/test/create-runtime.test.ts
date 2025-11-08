import { describe, expect, it, vi } from 'vitest'
import { createRuntimeFactory } from '@/create-runtime'

describe('createRuntimeFactory', () => {
  it('wraps library helpers with escape/unescape transformers', () => {
    const twMergeImpl = vi.fn((value: string) => value)
    const twJoinImpl = vi.fn((value: string) => value)
    const extendRuntimeImpl = vi.fn((value: string) => value)
    const createRuntimeImpl = vi.fn((value: string) => value)

    const extendTailwindMerge = vi.fn(() => extendRuntimeImpl)
    const createTailwindMerge = vi.fn(() => createRuntimeImpl)

    const createRuntime = createRuntimeFactory({
      version: 2,
      twMerge: twMergeImpl,
      twJoin: twJoinImpl,
      extendTailwindMerge,
      createTailwindMerge,
    })

    const runtime = createRuntime()

    expect(runtime.version).toBe(2)

    const merged = runtime.twMerge('text-_b_hececec_B')
    expect(twMergeImpl).toHaveBeenCalledWith('text-[#ececec]')
    expect(merged).toBe('text-_b_hececec_B')

    const joined = runtime.twJoin('text-_b_hececec_B')
    expect(twJoinImpl).toHaveBeenCalledWith('text-[#ececec]')
    expect(joined).toBe('text-_b_hececec_B')

    const extended = runtime.extendTailwindMerge('custom')
    expect(extendTailwindMerge).toHaveBeenCalledWith('custom')
    const extendedResult = extended('text-_b_hececec_B')
    expect(extendRuntimeImpl).toHaveBeenCalledWith('text-[#ececec]')
    expect(extendedResult).toBe('text-_b_hececec_B')

    const created = runtime.createTailwindMerge('foo')
    expect(createTailwindMerge).toHaveBeenCalledWith('foo')
    const createdResult = created('text-_b_hececec_B')
    expect(createRuntimeImpl).toHaveBeenCalledWith('text-[#ececec]')
    expect(createdResult).toBe('text-_b_hececec_B')
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
})
