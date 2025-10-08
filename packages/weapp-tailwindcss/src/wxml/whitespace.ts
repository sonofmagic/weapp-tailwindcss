const WHITESPACE_CODES = new Set([
  9, // \t
  10, // \n
  11, // \v
  12, // \f
  13, // \r
  32, // space
  160, // \u00A0
  65279, // \uFEFF
])

export function isWhitespace(char: string) {
  if (char.length === 0) {
    return false
  }
  return WHITESPACE_CODES.has(char.charCodeAt(0))
}

export function isAllWhitespace(value: string) {
  for (let i = 0; i < value.length; i++) {
    if (!WHITESPACE_CODES.has(value.charCodeAt(i))) {
      return false
    }
  }
  return true
}
