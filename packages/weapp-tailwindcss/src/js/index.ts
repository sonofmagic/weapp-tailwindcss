import type { CreateJsHandlerOptions, IJsHandlerOptions, JsHandler } from '../types'
import { defuOverrideArray } from '../utils'
import { jsHandler } from './babel'

export {
  jsHandler,
}

export function createJsHandler(options: CreateJsHandlerOptions): JsHandler {
  // 保留不可变的默认选项，重复调用时仅传入本次的覆盖项。
  const {
    arbitraryValues,
    escapeMap,
    jsPreserveClass,
    generateMap,
    needEscaped,
    alwaysEscape,
    unescapeUnicode,
    babelParserOptions,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
    uniAppX,
    moduleSpecifierReplacements,
  } = options

  function handler(rawSource: string, classNameSet?: Set<string>, options?: CreateJsHandlerOptions) {
    const overrideOptions = (options ?? {}) as IJsHandlerOptions
    const resolvedOptions = defuOverrideArray<IJsHandlerOptions, IJsHandlerOptions[]>(
      {
        ...overrideOptions,
        classNameSet,
      },
      {
        classNameSet,
        escapeMap,
        arbitraryValues,
        jsPreserveClass,
        generateMap,
        needEscaped,
        alwaysEscape,
        unescapeUnicode,
        babelParserOptions,
        ignoreCallExpressionIdentifiers,
        ignoreTaggedTemplateExpressionIdentifiers,
        uniAppX,
        moduleSpecifierReplacements,
      },
    )

    return jsHandler(rawSource, resolvedOptions)
  }

  return handler
}
