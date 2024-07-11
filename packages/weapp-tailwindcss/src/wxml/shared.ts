import type { ITemplateHandlerOptions } from '@/types'
import { SimpleMappingChars2String, escape } from '@/escape'

export function replaceWxml(
  original: string,
  options: ITemplateHandlerOptions = {
    keepEOL: false,
    escapeMap: SimpleMappingChars2String,
  },
) {
  const { keepEOL, escapeMap, mangleContext } = options
  let res = original
  if (!keepEOL) {
    res = res
      // 去除无用换行符和空格
      // 不能全去掉，头条小程序变量绑定，实现方式依赖空格，你说坑不坑？
      .replaceAll(/[\n\r]+/g, '')
  }
  if (mangleContext) {
    res = mangleContext.wxmlHandler(res)
  }

  res = escape(res, {
    map: escapeMap,
    ignoreHead: true,
  })

  return res
}
