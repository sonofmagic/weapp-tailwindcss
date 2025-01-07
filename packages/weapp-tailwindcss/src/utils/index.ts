import type { InternalUserDefinedOptions } from '../types'
import { defu, defuOverrideArray, groupBy, isMap, isRegexp, noop, regExpTest, removeExt } from '@weapp-tailwindcss/shared'

export {
  defu,
  defuOverrideArray,
  groupBy,
  isMap,
  isRegexp,
  noop,
  regExpTest,
  removeExt,
}

export function getGroupedEntries<T>(entries: [string, T][], options: InternalUserDefinedOptions) {
  const { cssMatcher, htmlMatcher, jsMatcher, wxsMatcher } = options
  const groupedEntries = groupBy(entries, ([file]) => {
    if (cssMatcher(file)) {
      return 'css'
    }
    else if (htmlMatcher(file)) {
      return 'html'
    }
    else if (jsMatcher(file) || wxsMatcher(file)) {
      return 'js'
    }
    else {
      return 'other'
    }
  })
  return groupedEntries as Record<'css' | 'html' | 'js' | 'other', [string, T][]>
}

// const MAX_ASCII_CHAR_CODE = 127

// export function isAscii(str: string) {
//   for (let i = 0, strLen = str.length; i < strLen; ++i) {
//     if (str.charCodeAt(i) > MAX_ASCII_CHAR_CODE) { return false }
//   }
//   return true
// }
