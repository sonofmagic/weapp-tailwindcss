import { MappingChars2StringEntries as defaultEntries, SimpleMappingChars2String } from '@/dic'
import { escapeStringRegexp } from '@/reg'
/**
 * @description 转义正则
 * @param selectors
 * @param raw
 * @returns
 */
export function escape(selectors: string, raw: boolean = false, entries: [string, string][] = defaultEntries) {
  let res = selectors
  // unicode replace
  // const stringbuilder = res.split('')
  // for (let i = 0; i < stringbuilder.length; i++) {
  //   const code = stringbuilder[i].charCodeAt(0)
  //   // MAX_ASCII_CHAR_CODE
  //   if (code > 127) {
  //     // 'u' means 'unicode'
  //     stringbuilder[i] = 'U' + Number(code).toString(16)
  //   }
  // }
  // res = stringbuilder.join('')

  for (let i = 0; i < entries.length; i++) {
    const [searchValue, replaceValue] = entries[i]

    res = res.replace(new RegExp((raw ? '\\\\' : '') + escapeStringRegexp(searchValue), 'g'), replaceValue)
  }
  return res
}
