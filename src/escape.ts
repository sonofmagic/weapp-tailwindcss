import { SimpleMappingChars2String } from '@/dic'
const MAX_ASCII_CHAR_CODE = 127

function isAsciiNumber(code: number) {
  return code >= 48 && code <= 57
}

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
      } else if (i === 0) {
        // 首位转义逻辑
        // https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
        if (isAsciiNumber(code)) {
          // 首位假如是数字，则需要向前补位_，不然会出现
          // 2xl:text-base -> .\32xlctext-base
          // 导致选择器报错
          // code >= 48 && code <= 57 < 10 -> 0~9
          sb[i] = '_' + char
        } else if (char === '-') {
          const nextChar = sb[i + 1]
          if (nextChar) {
            const nextCharCode = nextChar.codePointAt(0)
            if (nextCharCode && isAsciiNumber(nextCharCode)) {
              // 负数情况
              // 首位为 - ，第二位为数字的情况
              sb[i] = '_' + char
            }
          } else if (nextChar === undefined) {
            // 只有 -，则 - 需要转义
            sb[i] = '_' + char
          }
        }
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
