import { MappingChars2String as dic } from '@/dic'

// export function arbitraryValuesReplacer (str: string) {}

export function replaceWxml (original: string, keepEOL: boolean = false) {
  const res = original
    .replace(/\[/g, dic['['])
    .replace(/\]/g, dic[']'])
    .replace(/\(/g, dic['('])
    .replace(/\)/g, dic[')'])
    .replace(/#/g, dic['#']) // hex
    .replace(/!/g, dic['!']) // css !important
    .replace(/\//g, dic['/'])
    .replace(/\./g, dic['.'])
    .replace(/:/g, dic[':'])
    // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/8
    .replace(/%/g, dic['%'])
    .replace(/,/g, dic[','])
    .replace(/\\/g, dic['\\'])
    .replace(/'/g, dic["'"])
    .replace(/"/g, dic['"'])
    .replace(/\*/g, dic['*'])
    .replace(/&/g, dic['&'])
    .replace(/@/g, dic['@'])
    .replace(/{/g, dic['{'])
    .replace(/}/g, dic['}'])
  if (keepEOL) {
    return res
  }
  return (
    res
      // 去除无用换行符和空格
      .replace(/[\r\n]+/g, '')
  )
}
