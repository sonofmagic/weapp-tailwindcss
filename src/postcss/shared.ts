import { escape } from '@/escape'
import { SimpleMappingChars2String } from '@/dic'
import { IMangleScopeContext } from '@/types'
import { defu } from '@/utils'
import { defaultMangleContext } from '@/mangle'
// css 中，要多加一个 '\' 来转义
// for raw css selector
// export function cssSelectorReplacer(selector: string, escapeEntries = MappingChars2StringEntries) {
//   return escape(selector, true, escapeEntries).replace(/\\2c /g, dic[','])
// }

export interface InternalCssSelectorReplacerOptions {
  mangleContext?: IMangleScopeContext
  escapeMap?: Record<string, string>
}

export function internalCssSelectorReplacer(selectors: string, options?: InternalCssSelectorReplacerOptions) {
  const { mangleContext, escapeMap } = defu(options, {
    escapeMap: SimpleMappingChars2String
  }, defaultMangleContext)
  if (mangleContext) {
    selectors = mangleContext.cssHandler(selectors)
  }
  return escape(selectors, {
    map: escapeMap
  })
}
