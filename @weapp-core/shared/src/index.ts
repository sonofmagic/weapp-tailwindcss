import { createDefu } from 'defu'

export { default as set } from 'set-value'
export { default as get } from 'get-value'

export function escapeStringRegexp(str: string) {
  return str
    .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    .replace(/-/g, '\\x2d')
}

export function removeExtension(file: string) {
  return file.replace(/\.[^/.]+$/, '')
}

export function arrify<T>(val: T) {
  return Array.isArray(val) ? (val as T) : [val]
}

export { default as defu } from 'defu'

export const defuOverrideArray = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = value
    return true
  }
})
