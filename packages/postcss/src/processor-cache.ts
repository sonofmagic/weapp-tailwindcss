import type { ProcessOptions, Processor } from 'postcss'
import type { StyleProcessingPipeline } from './pipeline'
import type { IStyleHandlerOptions } from './types'
import postcss from 'postcss'
import { fingerprintOptions } from './fingerprint'
import { createStylePipeline } from './pipeline'

function createProcessOptions(options: IStyleHandlerOptions): ProcessOptions {
  return {
    from: undefined,
    ...(options.postcssOptions?.options ?? {}),
  }
}

export class StyleProcessorCache {
  private readonly pipelineCache = new WeakMap<IStyleHandlerOptions, StyleProcessingPipeline>()
  private readonly processOptionsCache = new WeakMap<IStyleHandlerOptions, { value: ProcessOptions, fingerprint?: string | undefined }>()
  private readonly processorCache = new WeakMap<IStyleHandlerOptions, Processor>()
  private readonly processorCacheByKey = new Map<string, Processor>()
  private readonly processorKeyCache = new WeakMap<IStyleHandlerOptions, string>()

  private createProcessorCacheKey(options: IStyleHandlerOptions) {
    const from = options.postcssOptions?.options?.from
    if (from == null) {
      return fingerprintOptions(options)
    }

    return fingerprintOptions({
      ...options,
      postcssOptions: {
        ...(options.postcssOptions ?? {}),
        options: {
          ...(options.postcssOptions?.options ?? {}),
          from: undefined,
        },
      },
    })
  }

  getPipeline(options: IStyleHandlerOptions) {
    let pipeline = this.pipelineCache.get(options)
    if (!pipeline) {
      pipeline = createStylePipeline(options)
      this.pipelineCache.set(options, pipeline)
    }
    return pipeline
  }

  getProcessOptions(options: IStyleHandlerOptions): ProcessOptions {
    const source = options.postcssOptions?.options
    const fingerprint = source ? fingerprintOptions(source) : undefined
    const cached = this.processOptionsCache.get(options)

    if (!cached || cached.fingerprint !== fingerprint) {
      const created = createProcessOptions(options)
      this.processOptionsCache.set(options, { value: created, fingerprint })
      return { ...created }
    }

    return { ...cached.value }
  }

  getProcessor(options: IStyleHandlerOptions) {
    let processor = this.processorCache.get(options)
    if (!processor) {
      let cacheKey = this.processorKeyCache.get(options)
      if (!cacheKey) {
        cacheKey = this.createProcessorCacheKey(options)
        this.processorKeyCache.set(options, cacheKey)
      }

      processor = this.processorCacheByKey.get(cacheKey)
      if (!processor) {
        const pipeline = this.getPipeline(options)
        processor = postcss(pipeline.plugins)
        this.processorCacheByKey.set(cacheKey, processor)
      }
      this.processorCache.set(options, processor)
    }
    return processor
  }
}
