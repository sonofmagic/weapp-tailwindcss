import type { CreateJsHandlerOptions, IJsHandlerOptions, JsHandler } from '../types'
import { defuOverrideArray } from '../utils'
import { jsHandler } from './babel'

export {
  jsHandler,
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

  function handler(rawSource: string, classNameSet?: Set<string>, options?: CreateJsHandlerOptions) {
    // 快路径：无覆盖选项时跳过 defuOverrideArray，直接合并 classNameSet
    if (!options || Object.keys(options).length === 0) {
      return jsHandler(rawSource, { ...defaults, classNameSet })
    }

    const resolvedOptions = defuOverrideArray<IJsHandlerOptions, IJsHandlerOptions[]>(
      {
        ...(options as IJsHandlerOptions),
        classNameSet,
      },
      defaults,
    )

    return jsHandler(rawSource, resolvedOptions)
  }

  return handler
}
