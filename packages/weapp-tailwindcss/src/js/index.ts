import type { CreateJsHandlerOptions, IJsHandlerOptions, JsHandler } from '../types'
import { defuOverrideArray } from '../utils'
import { jsHandler } from './babel'

export {
  jsHandler,
}

export function createJsHandler(options: CreateJsHandlerOptions): JsHandler {
  // Persist immutable options so repeated invocations only supply per-call overrides.
  const {
    mangleContext,
    arbitraryValues,
    escapeMap,
    jsPreserveClass,
    generateMap,
    babelParserOptions,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
    uniAppX,
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
        mangleContext,
        jsPreserveClass,
        generateMap,
        babelParserOptions,
        ignoreCallExpressionIdentifiers,
        ignoreTaggedTemplateExpressionIdentifiers,
        uniAppX,
      },
    )

    return jsHandler(rawSource, resolvedOptions)
  }

  return handler
}
