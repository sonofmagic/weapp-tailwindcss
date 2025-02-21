import type { CreateJsHandlerOptions, IJsHandlerOptions } from '../types'
import { defuOverrideArray } from '../utils'
import { jsHandler } from './babel'

export {
  jsHandler,
}

export function createJsHandler(options: CreateJsHandlerOptions) {
  const {
    mangleContext,
    arbitraryValues,
    escapeMap,
    jsPreserveClass,
    generateMap,
    babelParserOptions,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
  } = options

  function handler(rawSource: string, classNameSet: Set<string>, options?: CreateJsHandlerOptions) {
    const opts = defuOverrideArray<IJsHandlerOptions, IJsHandlerOptions[]>(options as IJsHandlerOptions, {
      classNameSet,
      escapeMap,
      arbitraryValues,
      mangleContext,
      jsPreserveClass,
      generateMap,
      babelParserOptions,
      ignoreCallExpressionIdentifiers,
      ignoreTaggedTemplateExpressionIdentifiers,
    })

    return jsHandler(rawSource, opts)
  }

  return handler
}
