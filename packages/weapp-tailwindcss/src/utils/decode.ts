const unicodeEscapeRE = /\\u([\dA-Fa-f]{4})/g

export function decodeUnicode(value: string) {
  return value.replace(unicodeEscapeRE, (_match, hex) => {
    const codePoint = Number.parseInt(hex, 16)
    return Number.isNaN(codePoint) ? _match : String.fromCharCode(codePoint)
  })
}

export function decodeUnicode2(input: string) {
  try {
    return JSON.parse(`"${input}"`)
  }
  catch (_error) {
    return decodeUnicode(input)
  }
}
