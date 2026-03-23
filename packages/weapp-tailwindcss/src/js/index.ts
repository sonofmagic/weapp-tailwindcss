import type { CreateJsHandlerOptions, IJsHandlerOptions, JsHandler } from '../types'
import { defuOverrideArray } from '../utils'
import { jsHandler } from './babel'

export {
  jsHandler,
}

function hasDefinedOverrides(options?: CreateJsHandlerOptions) {
  if (!options) {
    return false
  }

  for (const key in options) {
    if (options[key as keyof CreateJsHandlerOptions] !== undefined) {
      return true
    }
  }

  return false
}

const CACHEABLE_SOURCE_MAX_LENGTH = 512
const RESULT_CACHE_LIMIT = 256

function shouldCacheJsResult(rawSource: string, options: IJsHandlerOptions) {
  if (rawSource.length === 0 || rawSource.length > CACHEABLE_SOURCE_MAX_LENGTH) {
    return false
  }
  if (options.moduleGraph || options.filename) {
    return false
  }
  return true
}

export function createJsHandler(options: CreateJsHandlerOptions): JsHandler {
  // 预构建不可变的默认选项对象，避免每次调用都重新创建字面量。
  const defaults: IJsHandlerOptions = {
    escapeMap: options.escapeMap,
    staleClassNameFallback: options.staleClassNameFallback,
    jsArbitraryValueFallback: options.jsArbitraryValueFallback,
    tailwindcssMajorVersion: options.tailwindcssMajorVersion,
    arbitraryValues: options.arbitraryValues,
    jsPreserveClass: options.jsPreserveClass,
    generateMap: options.generateMap,
    needEscaped: options.needEscaped,
    alwaysEscape: options.alwaysEscape,
    unescapeUnicode: options.unescapeUnicode,
    babelParserOptions: options.babelParserOptions,
    ignoreCallExpressionIdentifiers: options.ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers: options.ignoreTaggedTemplateExpressionIdentifiers,
    uniAppX: options.uniAppX,
    moduleSpecifierReplacements: options.moduleSpecifierReplacements,
  } as IJsHandlerOptions
  const resolvedOptionsByClassNameSet = new WeakMap<Set<string>, IJsHandlerOptions>()
  let resolvedOptionsWithoutClassNameSet: IJsHandlerOptions | undefined
  const resolvedOverrideOptions = new WeakMap<CreateJsHandlerOptions, IJsHandlerOptions>()
  const resolvedOverrideOptionsByClassNameSet = new WeakMap<CreateJsHandlerOptions, WeakMap<Set<string>, IJsHandlerOptions>>()
  const resultCache = new WeakMap<IJsHandlerOptions, Map<string, ReturnType<typeof jsHandler>>>()

  function resolveDefaultOptions(classNameSet?: Set<string>) {
    if (!classNameSet) {
      if (!resolvedOptionsWithoutClassNameSet) {
        resolvedOptionsWithoutClassNameSet = {
          ...defaults,
          classNameSet,
        }
      }
      return resolvedOptionsWithoutClassNameSet
    }

    const cached = resolvedOptionsByClassNameSet.get(classNameSet)
    if (cached) {
      return cached
    }

    const created = {
      ...defaults,
      classNameSet,
    }
    resolvedOptionsByClassNameSet.set(classNameSet, created)
    return created
  }

  function getCachedJsResult(rawSource: string, resolvedOptions: IJsHandlerOptions) {
    if (!shouldCacheJsResult(rawSource, resolvedOptions)) {
      return undefined
    }

    const cache = resultCache.get(resolvedOptions)
    return cache?.get(rawSource)
  }

  function setCachedJsResult(
    rawSource: string,
    resolvedOptions: IJsHandlerOptions,
    result: ReturnType<typeof jsHandler>,
  ) {
    if (!shouldCacheJsResult(rawSource, resolvedOptions) || result.error || result.linked) {
      return result
    }

    let cache = resultCache.get(resolvedOptions)
    if (!cache) {
      cache = new Map<string, ReturnType<typeof jsHandler>>()
      resultCache.set(resolvedOptions, cache)
    }

    cache.set(rawSource, result)
    if (cache.size > RESULT_CACHE_LIMIT) {
      const firstKey = cache.keys().next().value
      if (typeof firstKey === 'string') {
        cache.delete(firstKey)
      }
    }

    return result
  }

  function resolveOptions(
    classNameSet?: Set<string>,
    overrideOptions?: CreateJsHandlerOptions,
  ) {
    if (!hasDefinedOverrides(overrideOptions)) {
      return resolveDefaultOptions(classNameSet)
    }

    if (!classNameSet) {
      const cached = resolvedOverrideOptions.get(overrideOptions!)
      if (cached) {
        return cached
      }

      const created = defuOverrideArray<IJsHandlerOptions, IJsHandlerOptions[]>(
        {
          ...(overrideOptions as IJsHandlerOptions),
          classNameSet,
        },
        defaults,
      )
      resolvedOverrideOptions.set(overrideOptions!, created)
      return created
    }

    let cache = resolvedOverrideOptionsByClassNameSet.get(overrideOptions!)
    if (!cache) {
      cache = new WeakMap<Set<string>, IJsHandlerOptions>()
      resolvedOverrideOptionsByClassNameSet.set(overrideOptions!, cache)
    }

    const cached = cache.get(classNameSet)
    if (cached) {
      return cached
    }

    const created = defuOverrideArray<IJsHandlerOptions, IJsHandlerOptions[]>(
      {
        ...(overrideOptions as IJsHandlerOptions),
        classNameSet,
      },
      defaults,
    )
    cache.set(classNameSet, created)
    return created
  }

  function handler(rawSource: string, classNameSet?: Set<string>, options?: CreateJsHandlerOptions) {
    const resolvedOptions = resolveOptions(classNameSet, options)

    const cached = getCachedJsResult(rawSource, resolvedOptions)
    if (cached) {
      return cached
    }

    return setCachedJsResult(rawSource, resolvedOptions, jsHandler(rawSource, resolvedOptions))
  }

  return handler
}
