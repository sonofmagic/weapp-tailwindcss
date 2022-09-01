import { MappingChars2String as dic } from '@/dic'
import { ICommonReplaceOptions } from '@/types'
import { mangleMark } from '@/mangle/expose'

// export function arbitraryValuesReplacer (str: string) {}

export function replaceWxml (
  original: string,
  options: ICommonReplaceOptions | boolean = {
    keepEOL: false,
    mangle: false
  }
) {
  if (typeof options === 'boolean') {
    options = {
      keepEOL: options,
      mangle: false
    }
  }
  let res = original
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
  if (!options.keepEOL) {
    res = res
      // 去除无用换行符和空格
      .replace(/[\r\n]+/g, '')
  }
  if (options.mangle) {
    res = mangleMark(res, options.classGenerator)
  }
  return res
}
