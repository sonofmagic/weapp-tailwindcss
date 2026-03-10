import type { ITemplateHandlerOptions } from '../types'
import { createAttributeMatcher, isPropsMatch } from './custom-attributes'
import { generateCode } from './utils/codegen'
import { customTemplateHandler } from './utils/custom-template'
import { templateReplacer } from './utils/template-fragments'

export { isPropsMatch }
export { customTemplateHandler, generateCode, templateReplacer }

export function createTemplateHandler(options: Omit<ITemplateHandlerOptions, 'runtimeSet'> = {}) {
  // 预构建 attribute matcher，避免每次处理文件都重建
  const cachedMatcher = createAttributeMatcher(
    (options as ITemplateHandlerOptions).customAttributesEntities,
  )
  const defaultOptions = options as Required<ITemplateHandlerOptions>
  let cachedRuntimeSet: Set<string> | undefined
  let cachedOptionsWithRuntimeSet: Required<ITemplateHandlerOptions> | undefined

  return (rawSource: string, opt?: Pick<ITemplateHandlerOptions, 'runtimeSet'>) => {
    const runtimeSet = opt?.runtimeSet
    if (runtimeSet === undefined) {
      return customTemplateHandler(rawSource, defaultOptions, cachedMatcher)
    }

    if (cachedRuntimeSet !== runtimeSet || !cachedOptionsWithRuntimeSet) {
      cachedRuntimeSet = runtimeSet
      cachedOptionsWithRuntimeSet = {
        ...defaultOptions,
        runtimeSet,
      } as Required<ITemplateHandlerOptions>
    }

    return customTemplateHandler(rawSource, cachedOptionsWithRuntimeSet, cachedMatcher)
  }
}
