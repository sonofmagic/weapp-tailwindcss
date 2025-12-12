import type { ProcessOptions, Processor } from 'postcss'
import type { StyleProcessingPipeline } from './pipeline'
import type { IStyleHandlerOptions } from './types'
import postcss from 'postcss'
import { createStylePipeline } from './pipeline'

function createProcessOptions(options: IStyleHandlerOptions): ProcessOptions {
  return {
    from: undefined,
    ...(options.postcssOptions?.options ?? {}),
  }
}

export class StyleProcessorCache {
  private readonly pipelineCache = new WeakMap<IStyleHandlerOptions, StyleProcessingPipeline>()
  private readonly processOptionsCache = new WeakMap<IStyleHandlerOptions, { value: ProcessOptions, source: unknown }>()
  private readonly processorCache = new WeakMap<IStyleHandlerOptions, Processor>()

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
    const cached = this.processOptionsCache.get(options)

    if (!cached || cached.source !== source) {
      const created = createProcessOptions(options)
      this.processOptionsCache.set(options, { value: created, source })
      return { ...created }
    }

    return { ...cached.value }
  }

  getProcessor(options: IStyleHandlerOptions) {
    let processor = this.processorCache.get(options)
    if (!processor) {
      const pipeline = this.getPipeline(options)
      processor = postcss(pipeline.plugins)
      this.processorCache.set(options, processor)
    }
    return processor
  }
}
