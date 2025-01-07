import { createDefu, defu } from 'defu'
import getValue from 'get-value'
import setValue from 'set-value'

export {
  defu,
  getValue,
  setValue,
}

export function isRegexp(value: unknown) {
  return Object.prototype.toString.call(value) === '[object RegExp]'
}

export function isMap(value: unknown) {
  return Object.prototype.toString.call(value) === '[object Map]'
}
export function regExpTest(arr: (string | RegExp)[], str: string) {
  if (!Array.isArray(arr)) {
    throw new TypeError('paramater \'arr\' should be an Array of Regexp | String')
  }

  for (const item of arr) {
    if (typeof item === 'string') {
      if (str.includes(item)) {
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

  const result: Record<string, T[]> = {}
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
