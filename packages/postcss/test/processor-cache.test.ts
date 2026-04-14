import type { FeatureSignal } from '@/content-probe'
import type { IStyleHandlerOptions } from '@/types'
import { EMPTY_SIGNAL, FULL_SIGNAL } from '@/content-probe'
import { describe, expect, it } from 'vitest'
import { StyleProcessorCache } from '@/processor-cache'

function createBaseOptions(): IStyleHandlerOptions {
  return {
    isMainChunk: false,
    cssInjectPreflight: () => [],
    cssSelectorReplacement: {
      universal: 'view',
    },
    cssPreflightRange: 'all',
  }
}

describe('style processor cache', () => {
  it('reflects in-place mutations for simple scalar process options', () => {
    const cache = new StyleProcessorCache()
    const options = {
      ...createBaseOptions(),
      postcssOptions: {
        options: {
          map: false,
          from: 'app.wxss',
        },
      },
    } satisfies IStyleHandlerOptions

    const first = cache.getProcessOptions(options)
    first.mutated = true

    options.postcssOptions.options.from = 'pages/index/index.wxss'

    const second = cache.getProcessOptions(options)

    expect(second).toEqual({
      from: 'pages/index/index.wxss',
      map: false,
    })
    expect(second).not.toHaveProperty('mutated')
  })

  it('falls back to deep fingerprinting for nested process options', () => {
    const cache = new StyleProcessorCache()
    const options = {
      ...createBaseOptions(),
      postcssOptions: {
        options: {
          map: {
            inline: false,
          },
        },
      },
    } satisfies IStyleHandlerOptions

    const first = cache.getProcessOptions(options)
    expect(first.map).toEqual({
      inline: false,
    })

    options.postcssOptions.options.map = {
      inline: true,
    }

    const second = cache.getProcessOptions(options)

    expect(second.map).toEqual({
      inline: true,
    })
    expect(second).not.toBe(first)
  })
})


describe('signal-aware caching', () => {
  it('returns different Processor for same options but different signals', () => {
    const cache = new StyleProcessorCache()
    const options = createBaseOptions()

    const processorFull = cache.getProcessor(options, FULL_SIGNAL)
    const processorEmpty = cache.getProcessor(options, EMPTY_SIGNAL)

    expect(processorFull).not.toBe(processorEmpty)
  })

  it('returns the same Processor for same options and same signal', () => {
    const cache = new StyleProcessorCache()
    const options = createBaseOptions()

    const first = cache.getProcessor(options, FULL_SIGNAL)
    const second = cache.getProcessor(options, FULL_SIGNAL)

    expect(first).toBe(second)
  })

  it('returns the same Processor for same options and equivalent signal object', () => {
    const cache = new StyleProcessorCache()
    const options = createBaseOptions()

    const signalA: FeatureSignal = { hasModernColorFunction: true, hasPresetEnvFeatures: false }
    const signalB: FeatureSignal = { hasModernColorFunction: true, hasPresetEnvFeatures: false }

    const first = cache.getProcessor(options, signalA)
    const second = cache.getProcessor(options, signalB)

    expect(first).toBe(second)
  })

  it('caching behavior is unchanged when no signal is passed', () => {
    const cache = new StyleProcessorCache()
    const options = createBaseOptions()

    const first = cache.getProcessor(options)
    const second = cache.getProcessor(options)

    expect(first).toBe(second)
  })

  it('returns different Processor for no signal vs explicit signal', () => {
    const cache = new StyleProcessorCache()
    const options = createBaseOptions()

    const withoutSignal = cache.getProcessor(options)
    const withSignal = cache.getProcessor(options, FULL_SIGNAL)

    expect(withoutSignal).not.toBe(withSignal)
  })

  it('returns different Pipeline for same options but different signals', () => {
    const cache = new StyleProcessorCache()
    const options = createBaseOptions()

    const pipelineFull = cache.getPipeline(options, FULL_SIGNAL)
    const pipelineEmpty = cache.getPipeline(options, EMPTY_SIGNAL)

    expect(pipelineFull).not.toBe(pipelineEmpty)
  })

  it('returns the same Pipeline for same options and same signal', () => {
    const cache = new StyleProcessorCache()
    const options = createBaseOptions()

    const first = cache.getPipeline(options, FULL_SIGNAL)
    const second = cache.getPipeline(options, FULL_SIGNAL)

    expect(first).toBe(second)
  })
})
