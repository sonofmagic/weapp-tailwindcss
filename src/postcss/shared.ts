import { escape } from '@/escape'
import { SimpleMappingChars2String } from '@/dic'
import { InternalCssSelectorReplacerOptions } from '@/types'
// css 中，要多加一个 '\' 来转义
// for raw css selector
// export function cssSelectorReplacer(selector: string, escapeEntries = MappingChars2StringEntries) {
//   return escape(selector, true, escapeEntries).replace(/\\2c /g, dic[','])
// }

export function internalCssSelectorReplacer(
  selectors: string,
  options: InternalCssSelectorReplacerOptions = {
    escapeMap: SimpleMappingChars2String
  }
) {
  const { mangleContext, escapeMap } = options
  if (mangleContext) {
    selectors = mangleContext.cssHandler(selectors)
  }
  return escape(selectors, {
    map: escapeMap
  })
}

export const cssUnescape = (str: string) => {
  return str.replaceAll(/\\([\dA-Fa-f]{1,6}[\t\n\f\r ]?|[\S\s])/g, (match) => {
    return match.length > 2 ? String.fromCodePoint(Number.parseInt(match.slice(1).trim(), 16)) : match[1]
  })
}
