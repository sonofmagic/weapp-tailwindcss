import type { InternalCssSelectorReplacerOptions } from './types'
import { escape, MappingChars2String } from '@weapp-core/escape'
// css 中，要多加一个 '\' 来转义
// for raw css selector
// export function cssSelectorReplacer(selector: string, escapeEntries = MappingChars2StringEntries) {
//   return escape(selector, true, escapeEntries).replace(/\\2c /g, dic[','])
// }

export function internalCssSelectorReplacer(
  selectors: string,
  options: InternalCssSelectorReplacerOptions = {
    escapeMap: MappingChars2String,
  },
) {
  const { escapeMap } = options
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
