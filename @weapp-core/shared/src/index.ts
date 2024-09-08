import { extname } from 'node:path'
import { createDefu } from 'defu'

export { default as defu } from 'defu'
export { default as get } from 'get-value'

export function escapeStringRegexp(str: string) {
  return str
    .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    .replace(/-/g, '\\x2d')
}

export function removeExtension(file: string) {
  return file.replace(/\.[^/.]+$/, '')
}

export function addExtension(filename: string, ext = '.js') {
  let result = `${filename}`
  if (!extname(filename)) {
    result += ext
  }
  return result
}

export function arrify<T>(val: T) {
  return Array.isArray(val) ? (val as T) : [val]
}

export { default as set } from 'set-value'

export const defuOverrideArray = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = value
    return true
  }
})

export function isObject(x: unknown): x is Record<string | symbol | number, unknown> {
  return typeof x === 'object' && x !== null
}
