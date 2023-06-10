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

function cssUnescapeReplace(value: string): string {
  return String.fromCodePoint(Number.parseInt(value.replaceAll('\\', ''), 16))
}

export function cssUnescape(value: string): string {
  return value.replaceAll('\\n', '').replaceAll(/\\([\dA-Fa-f]{1,6})\s?/g, cssUnescapeReplace)
}
