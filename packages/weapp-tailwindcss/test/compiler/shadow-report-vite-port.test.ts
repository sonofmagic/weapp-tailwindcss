import { afterEach, describe, expect, it, vi } from 'vitest'
import { getCompilerShadowRunSnapshot } from '@/compiler'

describe('vite compiler shadow run boundary', () => {
  afterEach(() => {
    vi.doUnmock('@/bundlers/vite/generate-bundle-runtime')
    vi.resetModules()
  })

  it('starts one report run for every generateBundle execution', async () => {
    const runtimeHandler = vi.fn(async () => undefined)
    vi.doMock('@/bundlers/vite/generate-bundle-runtime', () => ({
      createGenerateBundleHook: vi.fn(() => runtimeHandler),
    }))
    const { createGenerateBundleHook } = await import('@/bundlers/vite/generate-bundle')
    const runtimeState = {
      tailwindRuntime: { majorVersion: 4 },
      readyPromise: Promise.resolve(),
    }
    const handler = createGenerateBundleHook({ runtimeState } as any)
    const hookContext = { addWatchFile: vi.fn() }

    await handler.call(hookContext, {}, {})
    expect(getCompilerShadowRunSnapshot(runtimeState).revision).toBe(1)
    await handler.call(hookContext, {}, {})
    expect(getCompilerShadowRunSnapshot(runtimeState).revision).toBe(2)
    expect(runtimeHandler).toHaveBeenCalledTimes(2)
  })
})
