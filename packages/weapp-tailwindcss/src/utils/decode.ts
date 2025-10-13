const unicodeEscapeRE = /\\u([\dA-Fa-f]{4})/g
const unicodeEscapeTestRE = /\\u[\dA-Fa-f]{4}/

export function decodeUnicode(value: string) {
  if (!unicodeEscapeTestRE.test(value)) {
    return value
  }
  return value.replace(unicodeEscapeRE, (_match, hex) => {
    const codePoint = Number.parseInt(hex, 16)
    return Number.isNaN(codePoint) ? _match : String.fromCharCode(codePoint)
  })
}

export function decodeUnicode2(input: string) {
  if (!unicodeEscapeTestRE.test(input)) {
    return input
  }
  try {
    return JSON.parse(`"${input}"`)
  }
  catch (_error) {
    return decodeUnicode(input)
  }
}
