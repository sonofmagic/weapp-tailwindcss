import type { ITemplateHandlerOptions } from '../types'
import { defuOverrideArray } from '../utils'
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
  return (rawSource: string, opt: Pick<ITemplateHandlerOptions, 'runtimeSet'> = {}) => {
    return customTemplateHandler(rawSource, defuOverrideArray(opt, options) as Required<ITemplateHandlerOptions>, cachedMatcher)
  }
}
