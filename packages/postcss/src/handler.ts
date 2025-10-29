// 样式处理入口，负责构建和复用 PostCSS 管线
import type { ProcessOptions } from 'postcss'
import type { StyleProcessingPipeline } from './pipeline'
import type { IStyleHandlerOptions, StyleHandler } from './types'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import postcss from 'postcss'
import { getDefaultOptions } from './defaults'
import { createStylePipeline } from './pipeline'
import { createInjectPreflight } from './preflight'

// 根据用户配置抽取 PostCSS 的运行选项，默认关闭来源路径以避免 sourcemap 警告
function createProcessOptions(options: IStyleHandlerOptions): ProcessOptions {
  return {
    from: undefined,
    ...(options.postcssOptions?.options ?? {}),
  }
}

// 使用 WeakMap 缓存可复用的处理管线与 processOptions，避免重复实例化
const pipelineCache = new WeakMap<IStyleHandlerOptions, StyleProcessingPipeline>()
const processOptionsCache = new WeakMap<IStyleHandlerOptions, ProcessOptions>()
const processOptionsSourceCache = new WeakMap<IStyleHandlerOptions, unknown>()

// 获取或构建当前配置下的处理管线（包含插件列表与上下文）
function getCachedPipeline(options: IStyleHandlerOptions) {
  let pipeline = pipelineCache.get(options)
  if (!pipeline) {
    pipeline = createStylePipeline(options)
    pipelineCache.set(options, pipeline)
  }
  return pipeline
}

// 当 postcssOptions 变动时刷新缓存，确保每次处理拿到的是独立副本
function getCachedProcessOptions(options: IStyleHandlerOptions) {
  const source = options.postcssOptions?.options
  let cached = processOptionsCache.get(options)
  const cachedSource = processOptionsSourceCache.get(options)

  if (!cached || cachedSource !== source) {
    cached = createProcessOptions(options)
    processOptionsCache.set(options, cached)
    processOptionsSourceCache.set(options, source)
  }

  return { ...cached }
}

// 核心处理函数：以缓存的插件与配置执行 PostCSS 并返回异步结果
function styleHandler(rawSource: string, options: IStyleHandlerOptions) {
  const plugins = getCachedPipeline(options).plugins
  const processOptions = getCachedProcessOptions(options)

  return postcss(plugins)
    .process(
      rawSource,
      processOptions,
    )
    .async()
}

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
  getCachedPipeline(cachedOptions)
  getCachedProcessOptions(cachedOptions)

  const handler = ((rawSource: string, opt?: Partial<IStyleHandlerOptions>) => {
    const resolvedOptions = defuOverrideArray<
      IStyleHandlerOptions,
      Partial<IStyleHandlerOptions>[]
    >(opt as IStyleHandlerOptions, cachedOptions)

    return styleHandler(
      rawSource,
      resolvedOptions,
    )
  }) as StyleHandler

  handler.getPipeline = (opt?: Partial<IStyleHandlerOptions>) => {
    // 未传入覆盖项时复用初始化时缓存的管线
    if (!opt) {
      return getCachedPipeline(cachedOptions)
    }

    const resolvedOptions = defuOverrideArray<
      IStyleHandlerOptions,
      Partial<IStyleHandlerOptions>[]
    >(opt as IStyleHandlerOptions, cachedOptions)

    // 针对一次性覆盖构建独立管线，便于外部观察处理阶段
    return getCachedPipeline(resolvedOptions)
  }

  return handler
}
