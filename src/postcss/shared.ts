import { escape } from '@/escape'
import { SimpleMappingChars2String } from '@/dic'
import { useStore } from '@/mangle/store'
// css 中，要多加一个 '\' 来转义
// for raw css selector
// export function cssSelectorReplacer(selector: string, escapeEntries = MappingChars2StringEntries) {
//   return escape(selector, true, escapeEntries).replace(/\\2c /g, dic[','])
// }

export function internalCssSelectorReplacer(selectors: string, map: Record<string, string> = SimpleMappingChars2String) {
  const { cssHandler } = useStore()
  selectors = cssHandler(selectors)
  return escape(selectors, {
    map
  })
}
