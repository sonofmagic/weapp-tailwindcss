import type { ITemplateHandlerOptions } from '../types'
import { defuOverrideArray } from '../utils'
import { isPropsMatch } from './custom-attributes'
import { generateCode } from './utils/codegen'
import { customTemplateHandler } from './utils/custom-template'
import { templateReplacer } from './utils/template-fragments'

export { isPropsMatch }
export { customTemplateHandler, generateCode, templateReplacer }

export function createTemplateHandler(options: Omit<ITemplateHandlerOptions, 'runtimeSet'> = {}) {
  return (rawSource: string, opt: Pick<ITemplateHandlerOptions, 'runtimeSet'> = {}) => {
    return customTemplateHandler(rawSource, defuOverrideArray(opt, options) as Required<ITemplateHandlerOptions>)
  }
}
