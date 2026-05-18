import { afterEach, describe, expect, it, vi } from 'vitest'
import { createHmrTimingRecorder, emitHmrTiming, shouldEmitHmrTiming } from '@/bundlers/shared/hmr-timing'

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

  it('emits an overall plugin timing sample with hook summaries', () => {
    process.env.WEAPP_TW_HMR_TIMING = '1'
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const recorder = createHmrTimingRecorder('vite')

    recorder.record('sourceCandidates.buildStart', 2.2, { emit: false })
    recorder.record('generateBundle', 8.8)
    recorder.emitTotal()

    expect(write).toHaveBeenCalledTimes(4)
    expect(write).toHaveBeenNthCalledWith(1, '[weapp-tailwindcss:hmr] {"bundler":"vite","phase":"generateBundle","durationMs":9}\n')
    expect(write).toHaveBeenNthCalledWith(2, '[weapp-tailwindcss] vite:generateBundle 耗时 9ms\n')
    const totalLine = String((write.mock.calls[2] as unknown[][])[0])
    expect(totalLine).toContain('"phase":"total"')
    expect(totalLine).toContain('"durationMs":11')
    expect(totalLine).toContain('"sourceCandidates.buildStart":{"count":1,"durationMs":2,"maxMs":2}')
    expect(totalLine).toContain('"generateBundle":{"count":1,"durationMs":9,"maxMs":9}')
    expect(write).toHaveBeenNthCalledWith(4, expect.stringContaining('vite:weapp-tailwindcss 总耗时 11ms'))
  })
})
