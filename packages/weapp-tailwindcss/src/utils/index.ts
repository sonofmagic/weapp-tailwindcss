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

export type EntryGroup = 'css' | 'html' | 'js' | 'other'

function classifyEntry(filename: string, options: InternalUserDefinedOptions): EntryGroup {
  if (options.cssMatcher(filename)) {
    return 'css'
  }
  if (options.htmlMatcher(filename)) {
    return 'html'
  }
  if (options.jsMatcher(filename) || options.wxsMatcher(filename)) {
    return 'js'
  }
  return 'other'
}

function createEmptyGroups<T>(): Record<EntryGroup, [string, T][]> {
  return {
    css: [],
    html: [],
    js: [],
    other: [],
  }
}

export function getGroupedEntries<T>(entries: [string, T][], options: InternalUserDefinedOptions) {
  const groups = createEmptyGroups<T>()
  for (const entry of entries) {
    const [filename] = entry
    const group = classifyEntry(filename, options)
    groups[group].push(entry)
  }
  return groups
}

// const MAX_ASCII_CHAR_CODE = 127

// export function isAscii(str: string) {
//   for (let i = 0, strLen = str.length; i < strLen; ++i) {
//     if (str.charCodeAt(i) > MAX_ASCII_CHAR_CODE) { return false }
//   }
//   return true
// }
