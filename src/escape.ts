import { SimpleMappingChars2String } from '@/dic'
const MAX_ASCII_CHAR_CODE = 127
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
  const sb = [...selectors]
  for (let i = 0; i < sb.length; i++) {
    const char = sb[i]
    const code = char.codePointAt(0)
    // MAX_ASCII_CHAR_CODE
    if (code !== undefined && code > MAX_ASCII_CHAR_CODE) {
      // 'u' means 'unicode'
      sb[i] = 'u' + Number(code).toString(16)
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
