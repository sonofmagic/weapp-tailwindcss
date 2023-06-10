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
    const isCodeExisted = code !== undefined
    const hit = map[char]
    // "ABC".codePointAt(42); // undefined
    // MAX_ASCII_CHAR_CODE
    if (isCodeExisted) {
      if (code > MAX_ASCII_CHAR_CODE) {
        // 'u' means 'unicode'
        sb[i] = 'u' + Number(code).toString(16)
      } else if (hit) {
        sb[i] = hit
      } else if (i === 0 && code >= 48 && code <= 57) {
        // 首位假如是数字，则需要向前补位_，不然会出现
        // 2xl:text-base -> .\32xlctext-base
        // 导致选择器报错
        // code >= 48 && code <= 57 < 10 -> 0~9
        sb[i] = '_' + char
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
