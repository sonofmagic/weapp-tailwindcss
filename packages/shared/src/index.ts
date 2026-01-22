import { createDefu } from 'defu'
import getValue from 'get-value'
import setValue from 'set-value'

export { getValue, setValue }

export { defu } from 'defu'

const HTTP_PATTERN = /^https?:\/\//i
const CLEAN_URL_REGEXP = /[?#].*$/

export function isRegexp(value: unknown): value is RegExp {
  return value instanceof RegExp
}

export function isMap<T = unknown, K = unknown>(value: unknown): value is Map<T, K> {
  return value instanceof Map
}

export function isHttp(target: string) {
  return HTTP_PATTERN.test(target)
}

export function cleanUrl(url: string): string {
  return url.replace(CLEAN_URL_REGEXP, '')
}

export function toArray<T>(value: T | T[] | null | undefined): Array<NonNullable<T>> {
  if (value == null) {
    return []
  }
  return (Array.isArray(value) ? value : [value]) as Array<NonNullable<T>>
}

export function ensurePosix(value: string): string {
  return value.replace(/\\/g, '/')
}

export function normalizeRoot(root: string): string {
  const trimmed = root.trim().replace(/^[./\\]+/, '').replace(/\\+/g, '/')
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

export function normalizeRelativeImport(target: string): string {
  if (target.startsWith('.') || target.startsWith('/')) {
    return target
  }
  return `./${target}`
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

// const MAX_ASCII_CHAR_CODE = 127 最大 ASCII 字符码

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
      bucket.push(item)
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
