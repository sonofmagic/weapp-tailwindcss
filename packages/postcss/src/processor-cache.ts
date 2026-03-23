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

function getSimpleProcessOptionsCacheKey(options: Record<string, unknown>) {
  const parts: string[] = ['simple']

  for (const key of Object.keys(options).sort()) {
    const value = options[key]
    switch (typeof value) {
      case 'string':
        parts.push(`${key}:str:${value}`)
        break
      case 'number':
        parts.push(`${key}:num:${value}`)
        break
      case 'boolean':
        parts.push(`${key}:bool:${value ? '1' : '0'}`)
        break
      case 'undefined':
        parts.push(`${key}:undefined`)
        break
      case 'object':
        if (value === null) {
          parts.push(`${key}:null`)
          break
        }
        return undefined
      default:
        return undefined
    }
  }

  return parts.join('|')
}

export class StyleProcessorCache {
  private readonly pipelineCache = new WeakMap<IStyleHandlerOptions, StyleProcessingPipeline>()
  private readonly processOptionsCache = new WeakMap<IStyleHandlerOptions, { value: ProcessOptions, cacheKey?: string | undefined }>()
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
    const cacheKey = source
      ? getSimpleProcessOptionsCacheKey(source as Record<string, unknown>) ?? fingerprintOptions(source)
      : undefined
    const cached = this.processOptionsCache.get(options)

    if (!cached || cached.cacheKey !== cacheKey) {
      const created = createProcessOptions(options)
      this.processOptionsCache.set(options, { value: created, cacheKey })
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
