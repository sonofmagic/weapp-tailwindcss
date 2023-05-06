import { SimpleMappingChars2String } from '@/dic'

/**
 * @description 转义
 * @param selectors
 * @param raw
 * @returns
 */
export function escape(
  selectors: string,
  options: {
    map?: Record<string, string>
  } = {
    map: SimpleMappingChars2String
  }
) {
  const { map = <Record<string, string>>SimpleMappingChars2String } = options

  // unicode replace
  const sb = selectors.split('')
  for (let i = 0; i < sb.length; i++) {
    const char = sb[i]
    const code = char.charCodeAt(0)
    // MAX_ASCII_CHAR_CODE
    if (code > 127) {
      // 'u' means 'unicode'
      sb[i] = 'U' + Number(code).toString(16)
    } else {
      const hit = map[char]
      if (hit) {
        sb[i] = hit
      }
    }
  }
  const res = sb.join('')
  return res
  // res = stringbuilder.join('')

  // for (let i = 0; i < entries.length; i++) {
  //   const [searchValue, replaceValue] = entries[i]

  //   res = res.replace(new RegExp((raw ? '\\\\' : '') + escapeStringRegexp(searchValue), 'g'), replaceValue)
  // }
  // return res
}
