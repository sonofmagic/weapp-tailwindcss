// 样式处理入口，负责构建和复用 PostCSS 管线
import type { Result as PostcssResult } from 'postcss'
import type { FeatureSignal } from './content-probe'
import type { IStyleHandlerOptions, StyleHandler } from './types'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { LRUCache } from 'lru-cache'
import { applyUniAppXBaseCompatibility } from './compat/uni-app-x'
import { applyUniAppXUvueCompatibility } from './compat/uni-app-x-uvue'
import { probeFeatures, signalToCacheKey } from './content-probe'
import { getDefaultOptions } from './defaults'
import { fingerprintOptions } from './fingerprint'
import { createOptionsResolver } from './options-resolver'
import { createInjectPreflight } from './preflight'
import { StyleProcessorCache } from './processor-cache'

/** CSS 结果缓存最大条目数 */
const CSS_RESULT_CACHE_MAX = 256

/**
 * 简单字符串哈希函数（FNV-1a 变体），用于生成缓存键。
 * 不依赖 crypto 模块，适合高频调用场景。
 */
function simpleHash(str: string): string {
  let hash = 0x811C9DC5 | 0
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = (hash * 0x01000193) | 0
  }
  return (hash >>> 0).toString(36)
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
  const resolver = createOptionsResolver(cachedOptions)
  const processorCache = new StyleProcessorCache()
  const base = resolver.resolve()
  processorCache.getProcessor(base)
  processorCache.getProcessOptions(base)

  /** 选项指纹缓存，避免重复序列化 */
  const optionsFingerprintCache = new WeakMap<IStyleHandlerOptions, string>()

  /**
   * 获取选项指纹（带缓存）
   */
  function getOptionsFingerprint(opts: IStyleHandlerOptions): string {
    const cached = optionsFingerprintCache.get(opts)
    if (cached) {
      return cached
    }
    const fp = fingerprintOptions(opts)
    optionsFingerprintCache.set(opts, fp)
    return fp
  }

  /** CSS 处理结果 LRU 缓存 */
  const resultCache = new LRUCache<string, PostcssResult>({ max: CSS_RESULT_CACHE_MAX })

  /** 检测是否配置了用户 postcss 插件（如 tailwindcss），有用户插件时不做内容探测 */
  const hasUserPlugins = Boolean(
    cachedOptions.postcssOptions?.plugins
    && (Array.isArray(cachedOptions.postcssOptions.plugins)
      ? cachedOptions.postcssOptions.plugins.length > 0
      : typeof cachedOptions.postcssOptions.plugins === 'object'
        && Object.keys(cachedOptions.postcssOptions.plugins).length > 0),
  )

  const handler = ((rawSource: string, opt?: Partial<IStyleHandlerOptions>) => {
    const resolvedOptions = resolver.resolve(opt)
    // 当有用户插件时跳过内容探测，因为用户插件（如 tailwindcss）可能在 pre 阶段
    // 生成新的 CSS 特征（如现代颜色函数、:is() 伪类等），而 probeFeatures 只看原始输入
    let signal: FeatureSignal | undefined
    if (!hasUserPlugins) {
      try {
        signal = probeFeatures(rawSource)
      }
      catch {
        signal = undefined
      }
    }

    // 构建缓存键：选项指纹 + 信号 + 内容哈希
    const optsFp = getOptionsFingerprint(resolvedOptions)
    const signalKey = signal ? signalToCacheKey(signal) : ''
    const contentHash = simpleHash(rawSource)
    const cacheKey = `${optsFp}|${signalKey}|${contentHash}`

    const cachedResult = resultCache.get(cacheKey)
    if (cachedResult) {
      return Promise.resolve(cachedResult)
    }

    const processor = processorCache.getProcessor(resolvedOptions, signal)
    const processOptions = processorCache.getProcessOptions(resolvedOptions)

    return processor.process(
      rawSource,
      processOptions,
    ).async().then((result) => {
      const baseCompatible = applyUniAppXBaseCompatibility(result, resolvedOptions)
      const finalResult = applyUniAppXUvueCompatibility(baseCompatible, resolvedOptions)
      // 缓存最终结果
      resultCache.set(cacheKey, finalResult)
      return finalResult
    })
  }) as StyleHandler

  handler.getPipeline = (opt?: Partial<IStyleHandlerOptions>) => {
    const resolvedOptions = resolver.resolve(opt)
    return processorCache.getPipeline(resolvedOptions)
  }

  return handler
}
