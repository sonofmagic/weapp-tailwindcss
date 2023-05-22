
import type { InternalUserDefinedOptions } from '@/types'

export function isRegexp(value: unknown) {
  return Object.prototype.toString.call(value) === '[object RegExp]'
}

export function isMap(value: unknown) {
  return Object.prototype.toString.call(value) === '[object Map]'
}
export function regExpTest(arr: (string | RegExp)[] = [], str: string) {
  if (Array.isArray(arr)) {
    for (const item of arr) {
      if (typeof item === 'string') {
        if (item === str) {
          return true
        }
      } else if (isRegexp(item)) {
        item.lastIndex = 0
        if (item.test(str)) {
          return true
        }
      }
    }
    return false
  }
  throw new TypeError("paramater 'arr' should be a Array of Regexp | String !")
}

export const noop = () => {}

// const MAX_ASCII_CHAR_CODE = 127

// export function isAscii(str: string) {
//   for (let i = 0, strLen = str.length; i < strLen; ++i) {
//     if (str.charCodeAt(i) > MAX_ASCII_CHAR_CODE) { return false }
//   }
//   return true
// }



function groupBy<T>(arr: T[], cb: (arg: T) => string): Record<string, T[]> {
  if (!Array.isArray(arr)) {
    throw new TypeError('expected an array for first argument')
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected a function for second argument')
  }

  const result: Record<string, T[]> = {}
  for (const item of arr) {
    const bucketCategory = cb(item)
    const bucket = result[bucketCategory]

    if (Array.isArray(bucket)) {
      result[bucketCategory].push(item)
    } else {
      result[bucketCategory] = [item]
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

export { default as defu } from 'defu'