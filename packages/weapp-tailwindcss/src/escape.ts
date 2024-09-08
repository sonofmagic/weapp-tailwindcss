export { jsStringEscape } from '@ast-core/escape'
export * from '@weapp-core/escape'

export function decodeUnicode(s: string) {
  return unescape(s.replaceAll(/\\(u[\dA-Fa-f]{4})/g, '%$1'))
}

export function decodeUnicode2(input: string) {
  try {
    return JSON.parse(`"${input}"`)
  }
  catch (_error) {
    return input
  }
}
