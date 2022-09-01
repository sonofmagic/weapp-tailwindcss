import groupBy from 'lodash.groupby'
import type { UserDefinedOptions } from '@/types'

export function getGroupedEntries<T> (entries: [string, T][], options: Required<UserDefinedOptions>) {
  const { cssMatcher, htmlMatcher, jsMatcher } = options
  const groupedEntries = groupBy(entries, ([file]) => {
    if (cssMatcher(file)) {
      return 'css'
    } else if (htmlMatcher(file)) {
      return 'html'
    } else if (jsMatcher(file)) {
      return 'js'
    } else {
      return 'other'
    }
  })
  return groupedEntries
}
