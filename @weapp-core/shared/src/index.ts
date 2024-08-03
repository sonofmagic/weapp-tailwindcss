export { default as set } from 'set-value'
export { default as get } from 'get-value'

export function escapeStringRegexp(str: string) {
  return str
    .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    .replace(/-/g, '\\x2d')
}

export function removeExtension(file: string) {
  return file.replace(/\.[^./]+$/, '')
}
