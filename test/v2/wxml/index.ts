import { templateClassExactRegexp, tagWithEitherClassAndHoverClassRegexp } from '@/reg'
import { ITemplateHandlerOptions } from '@/types'
import { templateReplacer } from '@/wxml/utils'

export function templateHandler(rawSource: string, options: ITemplateHandlerOptions = {}) {
  if (options.disabledDefaultTemplateHandler) {
    return rawSource
  }
  return rawSource.replace(tagWithEitherClassAndHoverClassRegexp, (m0) => {
    return m0.replace(templateClassExactRegexp, (m1, className) => {
      return m1.replace(className, templateReplacer(className, options))
    })
  })
}
