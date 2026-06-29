export function jsStringEscape(value: unknown) {
  return String(value).replaceAll(/[\n\r"'\\\u2028\u2029]/g, (character) => {
    switch (character) {
      case '"':
      case '\'':
      case '\\':
        return `\\${character}`
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '\u2028':
        return '\\u2028'
      case '\u2029':
        return '\\u2029'
      default:
        return character
    }
  })
}
