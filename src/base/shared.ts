import type { InternalUserDefinedOptions } from '@/types'

function groupBy<T>(arr: T[], cb: (arg: T) => string): Record<string, T[]> {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array for first argument')
  }

  if (typeof cb !== 'function') {
    throw new Error('expected a function for second argument')
  }

  const result: Record<string, T[]> = {}
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    const bucketCategory = cb(item)
    const bucket = result[bucketCategory]

    if (!Array.isArray(bucket)) {
      result[bucketCategory] = [item]
    } else {
      result[bucketCategory].push(item)
    }
  }

  return result
}

export function getGroupedEntries<T>(entries: [string, T][], options: InternalUserDefinedOptions) {
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
  return groupedEntries as Record<'css' | 'html' | 'js' | 'other', [string, T][]>
}
