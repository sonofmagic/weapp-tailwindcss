import type { InternalUserDefinedOptions } from '../types'
import { defu, defuOverrideArray, groupBy, isMap, isRegexp, noop, regExpTest, removeExt } from '@weapp-tailwindcss/shared'

export * from './hbuilderx'

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
