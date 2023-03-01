import { ICommonReplaceOptions } from '@/types'
import { mangleMark } from '@/mangle/expose'
import { escape } from '@/base/escape'
import { SimpleMappingChars2StringEntries, MappingChars2StringEntries } from '@/dic'
export function replaceWxml(
  original: string,
  options: ICommonReplaceOptions | boolean = {
    keepEOL: false,
    escapeEntries: MappingChars2StringEntries
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
  res = escape(res, false, options.escapeEntries)

  if (options.classGenerator) {
    res = mangleMark(res, oldValue, options.classGenerator)
  }
  return res
}
