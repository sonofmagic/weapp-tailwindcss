import { createDefu } from 'defu'
import getValue from 'get-value'
import setValue from 'set-value'

export { getValue, setValue }

export { defu } from 'defu'

export function isRegexp(value: unknown): value is RegExp {
  return value instanceof RegExp
}

export function isMap<T = unknown, K = unknown>(value: unknown): value is Map<T, K> {
  return value instanceof Map
}
export function regExpTest(arr: (string | RegExp)[], str: string, options?: { exact?: boolean }) {
  if (!Array.isArray(arr)) {
    throw new TypeError('paramater \'arr\' should be an Array of Regexp | String')
  }

  for (const item of arr) {
    if (typeof item === 'string') {
      if (options?.exact) {
        if (str === item) {
          return true
        }
      }
      else if (str.includes(item)) {
        return true
      }
    }
    else if (isRegexp(item)) {
      item.lastIndex = 0
      if (item.test(str)) {
        return true
      }
    }
  }
  return false
}

export function noop() { }

// const MAX_ASCII_CHAR_CODE = 127

// export function isAscii(str: string) {
//   for (let i = 0, strLen = str.length; i < strLen; ++i) {
//     if (str.charCodeAt(i) > MAX_ASCII_CHAR_CODE) { return false }
//   }
//   return true
// }

export function groupBy<T>(arr: T[], cb: (arg: T) => string): Record<string, T[]> {
  if (!Array.isArray(arr)) {
    throw new TypeError('expected an array for first argument')
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected a function for second argument')
  }

  const result = Object.create(null) as Record<string, T[]>
  for (const item of arr) {
    const bucketCategory = cb(item)
    const bucket = result[bucketCategory]

    if (Array.isArray(bucket)) {
      result[bucketCategory].push(item)
    }
    else {
      result[bucketCategory] = [item]
    }
  }

  return result
}

export function removeExt(file: string) {
  if (!file) {
    return file
  }
  return file.replace(/\.[^./]*$/, '')
}

export const defuOverrideArray = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = value
    return true
  }
})
