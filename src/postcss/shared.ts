import { escape } from '@/base/escape'
import { MappingChars2String as dic } from '@/dic'
// css 中，要多加一个 '\' 来转义
export function cssSelectorReplacer (selector: string) {
  return escape(selector, true).replace(/\\2c /g, dic[','])
}

export function internalCssSelectorReplacer (selectors: string) {
  return escape(selectors)
}
