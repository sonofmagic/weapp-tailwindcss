// 样式处理入口，负责构建和复用 PostCSS 管线
import type { IStyleHandlerOptions, StyleHandler } from './types'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { getDefaultOptions } from './defaults'
import { createOptionsResolver } from './options-resolver'
import { createInjectPreflight } from './preflight'
import { StyleProcessorCache } from './processor-cache'

// createStyleHandler 提供带缓存的高阶处理器，同时暴露 getPipeline 供外部调试/扩展
export function createStyleHandler(options?: Partial<IStyleHandlerOptions>): StyleHandler {
  const cachedOptions = defuOverrideArray<
    IStyleHandlerOptions,
    Partial<IStyleHandlerOptions>[]
  >(
    options as IStyleHandlerOptions,
    getDefaultOptions(options),
  )

  cachedOptions.cssInjectPreflight = createInjectPreflight(cachedOptions.cssPreflight)
  const resolver = createOptionsResolver(cachedOptions)
  const cache = new StyleProcessorCache()
  const base = resolver.resolve()
  cache.getProcessor(base)
  cache.getProcessOptions(base)

  const handler = ((rawSource: string, opt?: Partial<IStyleHandlerOptions>) => {
    const resolvedOptions = resolver.resolve(opt)
    const processor = cache.getProcessor(resolvedOptions)
    const processOptions = cache.getProcessOptions(resolvedOptions)

    return processor.process(
      rawSource,
      processOptions,
    ).async()
  }) as StyleHandler

  handler.getPipeline = (opt?: Partial<IStyleHandlerOptions>) => {
    const resolvedOptions = resolver.resolve(opt)
    return cache.getPipeline(resolvedOptions)
  }

  return handler
}
