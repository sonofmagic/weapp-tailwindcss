import { tagWithEitherClassAndHoverClassRegexp, templateClassExactRegexp } from '@/reg'
import { templateReplacer } from '@/wxml/utils'
import type { ITemplateHandlerOptions } from '@/types'

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
