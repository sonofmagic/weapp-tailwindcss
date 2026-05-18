import { afterEach, describe, expect, it, vi } from 'vitest'
import { emitHmrTiming, shouldEmitHmrTiming } from '@/bundlers/shared/hmr-timing'

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
  vi.restoreAllMocks()
})

describe('bundlers/shared hmr timing', () => {
  it('emits no timing output when watch timing is disabled', () => {
    delete process.env.WEAPP_TW_WATCH_REGRESSION
    delete process.env.WEAPP_TW_HMR_TIMING
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    expect(shouldEmitHmrTiming()).toBe(false)
    emitHmrTiming('vite', 'generateBundle', 12.4)

    expect(write).not.toHaveBeenCalled()
  })

  it('keeps machine-readable timing for watch regression runs', () => {
    process.env.WEAPP_TW_WATCH_REGRESSION = '1'
    delete process.env.WEAPP_TW_HMR_TIMING
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    expect(shouldEmitHmrTiming()).toBe(true)
    emitHmrTiming('webpack', 'processAssets', 12.4)

    expect(write).toHaveBeenCalledTimes(1)
    expect(write).toHaveBeenCalledWith('[weapp-tailwindcss:hmr] {"bundler":"webpack","phase":"processAssets","durationMs":12}\n')
  })

  it('prints human-readable timing for local demo dev runs', () => {
    process.env.WEAPP_TW_HMR_TIMING = '1'
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    emitHmrTiming('gulp', 'watch', 8.6, { file: 'pages/index/index.wxss' })

    expect(write).toHaveBeenCalledTimes(2)
    expect(write).toHaveBeenNthCalledWith(1, '[weapp-tailwindcss:hmr] {"bundler":"gulp","phase":"watch","durationMs":9,"file":"pages/index/index.wxss"}\n')
    expect(write).toHaveBeenNthCalledWith(2, '[weapp-tailwindcss] gulp:watch 耗时 9ms file=pages/index/index.wxss\n')
  })

  it('allows local demo timing to keep only machine-readable output', () => {
    process.env.WEAPP_TW_HMR_TIMING = '1'
    process.env.WEAPP_TW_HMR_TIMING_LOG = '0'
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    emitHmrTiming('vite', 'generateBundle', 3)

    expect(write).toHaveBeenCalledTimes(1)
    expect(write).toHaveBeenCalledWith('[weapp-tailwindcss:hmr] {"bundler":"vite","phase":"generateBundle","durationMs":3}\n')
  })
})
