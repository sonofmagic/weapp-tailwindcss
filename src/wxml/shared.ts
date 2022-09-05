import { MappingChars2String as dic } from '@/dic'
import { ICommonReplaceOptions } from '@/types'
import { mangleMark } from '@/mangle/expose'

// export function arbitraryValuesReplacer (str: string) {}

export function replaceWxml (
  original: string,
  options: ICommonReplaceOptions | boolean = {
    keepEOL: false
  }
) {
  if (typeof options === 'boolean') {
    options = {
      keepEOL: options
    }
  }
  let res = original
  if (!options.keepEOL) {
    res = res
      // 去除无用换行符和空格
      // 不能全去掉，头条小程序变量绑定，实现方式依赖空格，你说坑不坑？
      .replace(/[\r\n]+/g, '')
  }
  const oldValue = res
  res = res
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

  if (options.classGenerator) {
    res = mangleMark(res, oldValue, options.classGenerator)
  }
  return res
}
