import { SimpleMappingChars2String, escape } from '../escape'
import type { InternalCssSelectorReplacerOptions } from '../types'
// css 中，要多加一个 '\' 来转义
// for raw css selector
// export function cssSelectorReplacer(selector: string, escapeEntries = MappingChars2StringEntries) {
//   return escape(selector, true, escapeEntries).replace(/\\2c /g, dic[','])
// }

export function internalCssSelectorReplacer(
  selectors: string,
  options: InternalCssSelectorReplacerOptions = {
    escapeMap: SimpleMappingChars2String,
  },
) {
  const { mangleContext, escapeMap } = options
  if (mangleContext) {
    selectors = mangleContext.cssHandler(selectors)
  }
  return escape(selectors, {
    map: escapeMap,
  })
}

export function composeIsPseudo(strs: string | string[]) {
  if (typeof strs === 'string') {
    return strs
  }
  if (strs.length > 1) {
    return `:is(${strs.join(',')})`
  }
  return strs.join('')
}
