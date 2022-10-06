import { escape } from '@/base/escape'
import { MappingChars2String as dic, MappingChars2StringEntries } from '@/dic'
// css 中，要多加一个 '\' 来转义
export function cssSelectorReplacer (selector: string, escapeEntries = MappingChars2StringEntries) {
  return escape(selector, true, escapeEntries).replace(/\\2c /g, dic[','])
}

export function internalCssSelectorReplacer (selectors: string, escapeEntries = MappingChars2StringEntries) {
  return escape(selectors, false, escapeEntries)
}
