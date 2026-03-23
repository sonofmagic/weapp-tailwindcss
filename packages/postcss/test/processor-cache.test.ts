import type { IStyleHandlerOptions } from '@/types'
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
