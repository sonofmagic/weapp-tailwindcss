import type { CreateJsHandlerOptions, IJsHandlerOptions } from '../types'
import { defuOverrideArray } from '../utils'
import { jsHandlerAsync } from './ast-grep'
import { jsHandler } from './babel'

export {
  jsHandler,
  jsHandlerAsync,
}

export function createJsHandler(options: CreateJsHandlerOptions) {
  const {
    mangleContext,
    arbitraryValues,
    escapeMap,
    jsPreserveClass,
    generateMap,
    jsAstTool,
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
      jsAstTool,
      babelParserOptions,
      ignoreCallExpressionIdentifiers,
      ignoreTaggedTemplateExpressionIdentifiers,
    })
    if (opts.jsAstTool === 'ast-grep') {
      return jsHandlerAsync(rawSource, opts)
    }
    return jsHandler(rawSource, opts)
  }

  function sync(rawSource: string, classNameSet: Set<string>, options?: CreateJsHandlerOptions) {
    const opts = defuOverrideArray<IJsHandlerOptions, IJsHandlerOptions[]>(options as IJsHandlerOptions, {
      classNameSet,
      escapeMap,
      arbitraryValues,
      mangleContext,
      jsPreserveClass,
      generateMap,
      jsAstTool,
      babelParserOptions,
      ignoreCallExpressionIdentifiers,
      ignoreTaggedTemplateExpressionIdentifiers,
    })
    return jsHandler(rawSource, opts)
  }

  handler.sync = sync

  return handler
}
